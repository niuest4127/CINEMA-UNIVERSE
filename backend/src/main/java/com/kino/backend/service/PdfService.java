package com.kino.backend.service;

import com.kino.backend.model.Ticket;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;

@Service
public class PdfService {

    private final QrCodeService qrCodeService;

    public PdfService(QrCodeService qrCodeService) {
        this.qrCodeService = qrCodeService;
    }

    public byte[] generateTicketPdf(Ticket ticket) throws Exception {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A6);
        PdfWriter.getInstance(document, out);

        document.open();


        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
        Paragraph title = new Paragraph("SCREEN UNIVERSE TICKET", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);

        document.add(new Paragraph(" "));


        document.add(new Paragraph("Movie: " + ticket.getScreening().getMovie().getTitle()));
        document.add(new Paragraph("Date: " + ticket.getScreening().getStartTime()));
        document.add(new Paragraph("Room: " + ticket.getScreening().getRoom().getName()));
        document.add(new Paragraph("Seat: " + ticket.getSeatNumber()));
        document.add(new Paragraph("Owner: " + ticket.getUser().getEmail()));

        document.add(new Paragraph(" "));


        String qrData = "TicketID: " + ticket.getId() + " | Seat: " + ticket.getSeatNumber();
        byte[] qrCodeImage = qrCodeService.generateQrCodeImage(qrData);
        Image qrImage = Image.getInstance(qrCodeImage);
        qrImage.setAlignment(Element.ALIGN_CENTER);
        document.add(qrImage);

        document.close();
        return out.toByteArray();
    }
}