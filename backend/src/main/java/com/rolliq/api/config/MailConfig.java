package com.rolliq.api.config;

import java.util.Properties;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

// Same "genuinely optional external integration" shape as FirebaseConfig:
// the bean only registers when MAIL_HOST is set, so EmailService's
// Optional<JavaMailSender> resolves to empty (not a null-bean) when SMTP
// hasn't been configured -- see push-notifications-setup.md for the
// Optional<T> constructor-injection reasoning this mirrors.
@Configuration
public class MailConfig {

    @Bean
    @ConditionalOnProperty(name = "MAIL_HOST")
    public JavaMailSender javaMailSender(Environment env) {
        JavaMailSenderImpl sender = new JavaMailSenderImpl();
        sender.setHost(env.getProperty("MAIL_HOST"));
        sender.setPort(Integer.parseInt(env.getProperty("MAIL_PORT", "587")));
        sender.setUsername(env.getProperty("MAIL_USERNAME"));
        sender.setPassword(env.getProperty("MAIL_PASSWORD"));

        Properties props = sender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        return sender;
    }
}
