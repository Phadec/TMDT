package com.example.trello.resolvers;

import com.example.trello.services.CardService;
import com.example.trello.dtos.*;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class CardResolver {
    private final CardService cardService;

    @QueryMapping
    public List<CardDTO> cardsByList(@Argument String listId) {
        return cardService.getCardsByListId(listId);
    }

    @MutationMapping
    public CardDTO createCard(@Argument CreateCardDTO input) {
        return cardService.createCard(input);
    }

    @MutationMapping
    public CardDTO updateCard(@Argument String id, @Argument UpdateCardDTO input) {
        return cardService.updateCard(id, input);
    }

    @MutationMapping
    public boolean deleteCard(@Argument String id) {
        cardService.deleteCard(id);
        return true;
    }

    @MutationMapping
    public CardDTO addComment(@Argument String cardId, @Argument CommentDTO input) {
        return cardService.addComment(cardId, input);
    }

    @MutationMapping
    public CardDTO removeComment(@Argument String cardId, @Argument String commentId) {
        return cardService.removeComment(cardId, commentId);
    }

    @MutationMapping
    public CardDTO addAttachment(@Argument String cardId, @Argument AttachmentDTO input) {
        return cardService.addAttachment(cardId, input);
    }

    @MutationMapping
    public CardDTO removeAttachment(@Argument String cardId, @Argument String attachmentId) {
        return cardService.removeAttachment(cardId, attachmentId);
    }

    @MutationMapping
    public CardDTO addCardMember(@Argument String cardId, @Argument String username) {
        return cardService.addMember(cardId, username);
    }

    @MutationMapping
    public CardDTO removeCardMember(@Argument String cardId, @Argument String username) {
        return cardService.removeMember(cardId, username);
    }

    @MutationMapping
    public CardDTO toggleCardComplete(@Argument String cardId) {
        return cardService.toggleComplete(cardId);
    }
}
