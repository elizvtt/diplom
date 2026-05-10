<!DOCTYPE html>
<html>
<head>
    <title>Запрошення до проєкту</title>
</head>
<body style="font-family: sans-serif; line-height: 1.6; color: #333;">
    <h2>Вітаємо!</h2>
    <p>Вас запросили приєднатися до проєкту <strong>"{{ $invitation->project->title }}"</strong>.</p>
    <p>Щоб прийняти запрошення, натисніть на кнопку нижче:</p>
    
    <div style="margin: 20px 0;">
        <a href="{{ url('/invite/' . $invitation->token) }}" 
           style="background: #555; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Приєднатися до команди
        </a>
    </div>

    <p>Це посилання дійсне до: {{ $invitation->expires_at->format('d.m.Y H:i') }}</p>
    <p>Якщо ви не очікували цього листа, просто ігноруйте його.</p>

</body>
</html>