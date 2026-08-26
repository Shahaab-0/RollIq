package com.rolliq.api.service;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class EmailService {

    private final Optional<JavaMailSender> mailSender;
    private final String fromAddress;

    // Exposed so integration tests (and local dev without MAIL_HOST set) can
    // retrieve the code that would have been emailed, instead of parsing
    // logs. Only ever populated on the no-mailSender branch below (see
    // sendPasswordResetCode) -- with a real JavaMailSender configured in
    // production, nothing writes to this map, so it can't grow unbounded
    // over the process lifetime.
    private final Map<String, String> lastCodeByEmail = new ConcurrentHashMap<>();

    public EmailService(
            Optional<JavaMailSender> mailSender,
            @Value("${MAIL_FROM:noreply@rolliq.app}") String fromAddress) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress;
    }

    public void sendPasswordResetCode(String toEmail, String code) {
        if (mailSender.isEmpty()) {
            lastCodeByEmail.put(toEmail, code);
            log.info(
                    "MAIL_HOST not configured -- would have emailed {} this reset code: {}",
                    toEmail,
                    code);
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(toEmail);
        message.setSubject("Your RollIQ password reset code");
        message.setText(
                "Your password reset code is: "
                        + code
                        + "\n\nThis code expires in 15 minutes. If you didn't request this, you"
                        + " can safely ignore this email.");
        mailSender.get().send(message);
    }

    public String lastCodeFor(String email) {
        return lastCodeByEmail.get(email);
    }
}
