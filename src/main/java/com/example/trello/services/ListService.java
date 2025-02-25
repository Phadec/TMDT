package com.example.trello.services;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.trello.dtos.CreateListDTO;
import com.example.trello.dtos.ListDTO;
import com.example.trello.dtos.UpdateListDTO;
import com.example.trello.models.ListEntity;
import com.example.trello.repositories.ListRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.time.LocalDateTime;
import com.example.trello.exceptions.ListException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ListService {
    @Autowired
    private ListRepository listRepository;
    
    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private BoardService boardService;

    public List<ListDTO> getAllListsByBoardId(String boardId) {
        verifyBoardAccess(boardId);
        return listRepository.findByBoardIdAndArchivedFalse(boardId)
            .stream()
            .sorted((a, b) -> Integer.compare(a.getPosition(), b.getPosition()))
            .map(list -> modelMapper.map(list, ListDTO.class))
            .collect(Collectors.toList());
    }

    public List<ListDTO> getArchivedLists(String boardId) {
        verifyBoardAccess(boardId);
        return listRepository.findByBoardIdAndArchivedTrue(boardId)
            .stream()
            .map(list -> modelMapper.map(list, ListDTO.class))
            .collect(Collectors.toList());
    }

    public ListDTO createList(CreateListDTO createListDTO) {
        verifyBoardAccess(createListDTO.getBoardId());
        
        ListEntity entity = modelMapper.map(createListDTO, ListEntity.class);
        entity.setCreatedAt(LocalDateTime.now());
        entity.setUpdatedAt(LocalDateTime.now());
        entity.setArchived(false);
        entity.setSubscribed(false);
        entity.setWatcherCount(0);
        entity.setLastModifiedBy(getCurrentUsername());
        
        // Initialize lists if null
        if (entity.getSubscribedUsers() == null) {
            entity.setSubscribedUsers(new ArrayList<>());
        }
        if (entity.getCardIds() == null) {
            entity.setCardIds(new ArrayList<>());
        }
        
        assignPosition(entity);
        
        ListEntity savedEntity = listRepository.save(entity);
        return modelMapper.map(savedEntity, ListDTO.class);
    }

    public ListDTO updateList(String id, UpdateListDTO updateListDTO) {
        ListEntity existingList = findListById(id);
        verifyBoardAccess(existingList.getBoardId());
        
        updateListFields(existingList, updateListDTO);
        
        existingList.setUpdatedAt(LocalDateTime.now());
        existingList.setLastModifiedBy(getCurrentUsername());
        
        ListEntity updatedEntity = listRepository.save(existingList);
        return modelMapper.map(updatedEntity, ListDTO.class);
    }

    public ListDTO toggleArchived(String id) {
        ListEntity list = findListById(id);
        verifyBoardAccess(list.getBoardId());
        
        list.setArchived(!list.isArchived());
        list.setArchivedAt(list.isArchived() ? LocalDateTime.now() : null);
        list.setUpdatedAt(LocalDateTime.now());
        list.setLastModifiedBy(getCurrentUsername());
        
        ListEntity updatedEntity = listRepository.save(list);
        return modelMapper.map(updatedEntity, ListDTO.class);
    }

    public ListDTO toggleSubscription(String id) {
        ListEntity list = listRepository.findById(id)
            .orElseThrow(() -> new ListException(
                String.format("List with id %s not found", id), 
                ListException.LIST_NOT_FOUND
            ));
        verifyBoardAccess(list.getBoardId());
        
        String username = getCurrentUsername();
        
        if (list.getSubscribedUsers() == null) {
            list.setSubscribedUsers(new ArrayList<>());
        }
        
        if (list.getSubscribedUsers().contains(username)) {
            list.getSubscribedUsers().remove(username);
        } else {
            list.getSubscribedUsers().add(username);
        }
        
        list.setWatcherCount(list.getSubscribedUsers().size());
        list.setUpdatedAt(LocalDateTime.now());
        list.setLastModifiedBy(username);
        
        ListEntity updatedEntity = listRepository.save(list);
        return modelMapper.map(updatedEntity, ListDTO.class);
    }

    @Transactional
    public void deleteList(String id) {
        ListEntity list = findListById(id);
        verifyBoardAccess(list.getBoardId());
        
        // Reorder remaining lists
        listRepository.findByBoardId(list.getBoardId()).stream()
            .filter(l -> l.getPosition() > list.getPosition())
            .forEach(l -> {
                l.setPosition(l.getPosition() - 1);
                listRepository.save(l);
            });
        
        listRepository.deleteById(id);
    }

    private ListEntity findListById(String id) {
        return listRepository.findById(id)
            .orElseThrow(() -> new ListException("List not found", ListException.LIST_NOT_FOUND));
    }

    private void verifyBoardAccess(String boardId) {
        if (!boardService.hasAccess(boardId)) {
            throw new ListException("Unauthorized access to board", ListException.UNAUTHORIZED_ACCESS);
        }
    }

    private void assignPosition(ListEntity list) {
        int maxPosition = listRepository.findByBoardId(list.getBoardId())
            .stream()
            .mapToInt(ListEntity::getPosition)
            .max()
            .orElse(-1);
        list.setPosition(maxPosition + 1);
    }

    private String getCurrentUsername() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    private void updateListFields(ListEntity existingList, UpdateListDTO updateListDTO) {
        if (updateListDTO.getName() != null) {
            existingList.setName(updateListDTO.getName());
        }
        
        if (updateListDTO.getCardIds() != null) {
            existingList.setCardIds(updateListDTO.getCardIds());
        }
        
        if (updateListDTO.getPosition() != null) {
            handlePositionUpdate(existingList, updateListDTO.getPosition());
        }
        
        if (updateListDTO.getArchived() != null) {
            existingList.setArchived(updateListDTO.getArchived());
            if (updateListDTO.getArchived()) {
                existingList.setArchivedAt(LocalDateTime.now());
            }
        }
        
        if (updateListDTO.getDescription() != null) {
            existingList.setDescription(updateListDTO.getDescription());
        }
        
        if (updateListDTO.getColor() != null) {
            existingList.setColor(updateListDTO.getColor());
        }
        
        if (updateListDTO.getSubscribedUsers() != null) {
            existingList.setSubscribedUsers(updateListDTO.getSubscribedUsers());
        } else if (existingList.getSubscribedUsers() == null) {
            existingList.setSubscribedUsers(new ArrayList<>());
        }
        existingList.setWatcherCount(existingList.getSubscribedUsers().size());
    }

    private void handlePositionUpdate(ListEntity list, int newPosition) {
        int oldPosition = list.getPosition();
        list.setPosition(newPosition);

        // Update positions of other lists
        List<ListEntity> affectedLists = listRepository.findByBoardId(list.getBoardId());
        for (ListEntity otherList : affectedLists) {
            if (otherList.getId().equals(list.getId())) continue;
            
            if (oldPosition < newPosition) {
                if (otherList.getPosition() <= newPosition && otherList.getPosition() > oldPosition) {
                    otherList.setPosition(otherList.getPosition() - 1);
                    listRepository.save(otherList);
                }
            } else {
                if (otherList.getPosition() >= newPosition && otherList.getPosition() < oldPosition) {
                    otherList.setPosition(otherList.getPosition() + 1);
                    listRepository.save(otherList);
                }
            }
        }
    }
}
