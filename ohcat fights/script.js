$recaptcha = htmlspecialchars_POST['g-recaptcha-response'], ENT_QUOTES, "UTF-8");

if (isset(Srecaptcha)) ‹
$secret="6Lfcnu4qAAAAAANIatlaQW58dZvzHIRxP1vMGEc3";
$res = @file_get_contents*https://www.google.com/recaptcha/api/siteverify?secret=($secret) &resonse=($recaptcha}");
$result = json_decode($res, true);
if (intval($result ["success"]) ! = = 1) {
// reCAPTCHA認証エラー
^
} else (
// reCAPTCHAトークン取得エラー
}
