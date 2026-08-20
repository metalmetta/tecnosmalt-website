module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  var body = req.body || {};
  var name = String(body.name || "").trim();
  var company = String(body.company || "").trim();
  var email = String(body.email || "").trim();
  var phone = String(body.phone || "").trim();
  var message = String(body.message || "").trim();
  var lang = body.lang === "en" ? "en" : "it";

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }

  var apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not set");
    return res.status(500).json({ error: "Server not configured" });
  }

  var subject = lang === "en"
    ? "Quote request — " + (company || name)
    : "Richiesta preventivo — " + (company || name);

  var escapeHtml = function (str) {
    return str.replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };

  var rows = lang === "en"
    ? [["Name", name], ["Company", company], ["Email", email], ["Phone", phone]]
    : [["Nome", name], ["Azienda", company], ["Email", email], ["Telefono", phone]];

  var html = "<div>"
    + rows.map(function (r) {
        return "<p><strong>" + escapeHtml(r[0]) + ":</strong> " + escapeHtml(r[1] || "-") + "</p>";
      }).join("")
    + "<p><strong>" + (lang === "en" ? "Message" : "Messaggio") + ":</strong></p>"
    + "<p>" + escapeHtml(message).replace(/\n/g, "<br>") + "</p>"
    + "</div>";

  try {
    var resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Tecnosmalt <onboarding@resend.dev>",
        to: ["info@tecnosmalt.it"],
        reply_to: email,
        subject: subject,
        html: html,
      }),
    });

    if (!resendRes.ok) {
      var errText = await resendRes.text();
      console.error("Resend error:", resendRes.status, errText);
      return res.status(502).json({ error: "Failed to send email" });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Send error:", err);
    return res.status(500).json({ error: "Failed to send email" });
  }
};
