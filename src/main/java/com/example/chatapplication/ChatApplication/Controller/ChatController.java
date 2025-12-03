package com.example.chatapplication.ChatApplication.Controller;


import com.example.chatapplication.ChatApplication.model.ChatMessage;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.time.Instant;

@Controller
public class ChatController {

    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/public")
    public ChatMessage sendMessage(ChatMessage message) {
        // add server-side timestamp
        message.setTime(Instant.now().toString());
        return message;
    }

    @MessageMapping("/chat.addUser")
    @SendTo("/topic/public")
    public ChatMessage addUser(ChatMessage message) {
        message.setTime(Instant.now().toString());
        message.setType(ChatMessage.MessageType.JOIN);
        return message;
    }
}
