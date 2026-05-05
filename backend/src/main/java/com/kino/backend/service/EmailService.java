package com.kino.backend.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendTicketWithAttachment(String to, String movieTitle, byte[] pdfContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(to);
            helper.setSubject("Twój bilet na film: " + movieTitle);
            helper.setText("Dziękujemy za zakup biletów w Screen Universe! Twój bilet znajdziesz w załączniku.");

            helper.addAttachment("Bilet_" + movieTitle + ".pdf", new ByteArrayResource(pdfContent));

            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Błąd wysyłki maila: " + e.getMessage());
        }
    }
}