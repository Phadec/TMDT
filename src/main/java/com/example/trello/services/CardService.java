package com.example.trello.services;

import com.example.trello.dtos.AttachmentDTO;
import com.example.trello.dtos.CardDTO;
import com.example.trello.dtos.CommentDTO;
import com.example.trello.dtos.CreateCardDTO;
import com.example.trello.dtos.UpdateCardDTO;
import com.example.trello.exceptions.ResourceNotFoundException;
import com.example.trello.models.Attachment;
import com.example.trello.models.CardEntity;
import com.example.trello.models.Comment;
import com.example.trello.repositories.CardRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CardService {
    private final CardRepository cardRepository;
    private final ModelMapper modelMapper;

    public List<CardDTO> getCardsByListId(String listId) {
        List<CardEntity> cards = cardRepository.findByListIdOrderByPositionAsc(listId);
        return cards.stream()
                .map(card -> {
                    CardDTO cardDTO = modelMapper.map(card, CardDTO.class);
                    if (cardDTO.getCreatedBy() == null) {
                        cardDTO.setCreatedBy("system"); // Default value if none exists
                    }
                    if (cardDTO.getLastModifiedBy() == null) {
                        cardDTO.setLastModifiedBy("system");
                    }
                    return cardDTO;
                })
                .collect(Collectors.toList());
    }

    public CardDTO createCard(CreateCardDTO createCardDTO) {
        CardEntity cardEntity = modelMapper.map(createCardDTO, CardEntity.class);
        
        String username;
        try {
            username = SecurityContextHolder.getContext().getAuthentication().getName();
        } catch (Exception e) {
            username = "system";
        }
        
        cardEntity.setCreatedBy(username);
        cardEntity.setLastModifiedBy(username);
        cardEntity.setCompleted(false);
        cardEntity.setWatcherCount(0);
        cardEntity.setCreatedAt(new Date());
        cardEntity.setUpdatedAt(new Date());
        
        // Calculate new position
        Integer maxPosition = cardRepository.findMaxPosition(createCardDTO.getListId());
        cardEntity.setPosition(maxPosition != null ? maxPosition + 1 : 0);
        
        CardEntity savedCard = cardRepository.save(cardEntity);
        return modelMapper.map(savedCard, CardDTO.class);
    }

    public CardDTO updateCard(String id, UpdateCardDTO updateCardDTO) {
        CardEntity existingCard = cardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found with id: " + id));

        // Get current authenticated user
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        existingCard.setLastModifiedBy(username);

        // Only update non-null fields
        if (updateCardDTO.getTitle() != null) {
            existingCard.setTitle(updateCardDTO.getTitle());
        }
        if (updateCardDTO.getDescription() != null) {
            existingCard.setDescription(updateCardDTO.getDescription());
        }
        
        // Handle position update if needed
        if (existingCard.getPosition() != updateCardDTO.getPosition()) {
            reorderCards(existingCard.getListId(), existingCard.getPosition(), updateCardDTO.getPosition());
            existingCard.setPosition(updateCardDTO.getPosition());
        }

        existingCard.setUpdatedAt(new Date());
        
        CardEntity updatedCard = cardRepository.save(existingCard);
        return modelMapper.map(updatedCard, CardDTO.class);
    }

    private void reorderCards(String listId, int oldPosition, int newPosition) {
        if (oldPosition == newPosition) return;
        
        List<CardEntity> cards = cardRepository.findByListIdAndPositionBetween(
            listId,
            Math.min(oldPosition, newPosition),
            Math.max(oldPosition, newPosition)
        );

        for (CardEntity card : cards) {
            if (oldPosition < newPosition) {
                if (card.getPosition() <= newPosition && card.getPosition() > oldPosition) {
                    card.setPosition(card.getPosition() - 1);
                }
            } else {
                if (card.getPosition() >= newPosition && card.getPosition() < oldPosition) {
                    card.setPosition(card.getPosition() + 1);
                }
            }
        }

        cardRepository.saveAll(cards);
    }

    public void deleteCard(String id) {
        cardRepository.deleteById(id);
    }

    public CardDTO getCardById(String id) {
        CardEntity card = cardRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Card not found with id: " + id));
        
        CardDTO cardDTO = modelMapper.map(card, CardDTO.class);
        if (cardDTO.getCreatedBy() == null) {
            cardDTO.setCreatedBy("system");
        }
        if (cardDTO.getLastModifiedBy() == null) {
            cardDTO.setLastModifiedBy("system");
        }
        return cardDTO;
    }

    public CardDTO addComment(String cardId, CommentDTO commentDTO) {
        CardEntity card = cardRepository.findById(cardId)
            .orElseThrow(() -> new RuntimeException("Card not found with id: " + cardId));
            
        Comment comment = modelMapper.map(commentDTO, Comment.class);
        comment.setId(UUID.randomUUID().toString());
        comment.setCreatedAt(new Date());
        
        card.getComments().add(comment);
        card.setUpdatedAt(new Date());
        
        return modelMapper.map(cardRepository.save(card), CardDTO.class);
    }

    public CardDTO removeComment(String cardId, String commentId) {
        CardEntity card = cardRepository.findById(cardId)
            .orElseThrow(() -> new RuntimeException("Card not found with id: " + cardId));
            
        card.setComments(card.getComments().stream()
            .filter(c -> !c.getId().equals(commentId))
            .collect(Collectors.toList()));
        card.setUpdatedAt(new Date());
        
        return modelMapper.map(cardRepository.save(card), CardDTO.class);
    }

    public CardDTO addAttachment(String cardId, AttachmentDTO attachmentDTO) {
        CardEntity card = cardRepository.findById(cardId)
            .orElseThrow(() -> new RuntimeException("Card not found with id: " + cardId));
            
        Attachment attachment = modelMapper.map(attachmentDTO, Attachment.class);
        attachment.setId(UUID.randomUUID().toString());
        attachment.setCreatedAt(new Date());
        
        card.getAttachments().add(attachment);
        card.setUpdatedAt(new Date());
        
        return modelMapper.map(cardRepository.save(card), CardDTO.class);
    }

    public CardDTO removeAttachment(String cardId, String attachmentId) {
        CardEntity card = cardRepository.findById(cardId)
            .orElseThrow(() -> new RuntimeException("Card not found with id: " + cardId));
            
        card.setAttachments(card.getAttachments().stream()
            .filter(a -> !a.getId().equals(attachmentId))
            .collect(Collectors.toList()));
        card.setUpdatedAt(new Date());
        
        return modelMapper.map(cardRepository.save(card), CardDTO.class);
    }

    public CardDTO addMember(String cardId, String username) {
        CardEntity card = cardRepository.findById(cardId)
            .orElseThrow(() -> new ResourceNotFoundException("Card not found with id: " + cardId));
        
        if (card.getAssignedMembers().add(username)) {
            card.setUpdatedAt(new Date());
            card = cardRepository.save(card);
        }
        
        return modelMapper.map(card, CardDTO.class);
    }

    public CardDTO removeMember(String cardId, String username) {
        CardEntity card = cardRepository.findById(cardId)
            .orElseThrow(() -> new ResourceNotFoundException("Card not found with id: " + cardId));
        
        if (card.getAssignedMembers().remove(username)) {
            card.setUpdatedAt(new Date());
            card = cardRepository.save(card);
        }
        
        return modelMapper.map(card, CardDTO.class);
    }

    public CardDTO toggleComplete(String cardId) {
        CardEntity card = cardRepository.findById(cardId)
            .orElseThrow(() -> new ResourceNotFoundException("Card not found with id: " + cardId));
        
        // Toggle completion status
        card.setCompleted(!card.isCompleted());
        
        // Update modification info
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        card.setLastModifiedBy(username);
        card.setUpdatedAt(new Date());
        
        CardEntity savedCard = cardRepository.save(card);
        return modelMapper.map(savedCard, CardDTO.class);
    }


    public CardDTO addLabel(String cardId, String labelColor) {
        CardEntity card = cardRepository.findById(cardId)
            .orElseThrow(() -> new ResourceNotFoundException("Card not found with id: " + cardId));
        
        if (card.getLabelColors().add(labelColor)) {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            card.setLastModifiedBy(username);
            card.setUpdatedAt(new Date());
            card = cardRepository.save(card);
        }
        
        return modelMapper.map(card, CardDTO.class);
    }
}
