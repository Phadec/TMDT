package com.example.trello.services;

import com.example.trello.dtos.BoardDTO;
import com.example.trello.dtos.CreateBoardDTO;
import com.example.trello.dtos.UpdateBoardDTO;
import com.example.trello.dtos.BoardDTO.LabelDTO;
import com.example.trello.models.Board;
import com.example.trello.repositories.BoardRepository;
import com.example.trello.exceptions.BadRequestException;
import com.example.trello.exceptions.ResourceNotFoundException;

import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BoardService {
    private final BoardRepository boardRepository;
    private final ModelMapper modelMapper;

    private void validateOwner(Board board, String username) {
        if (!board.getOwner().equals(username)) {
            throw new BadRequestException("Only the board owner can perform this operation");
        }
    }

    public BoardDTO createBoard(CreateBoardDTO createBoardDTO, String username) {
        Board board = new Board();
        board.setName(createBoardDTO.getName());
        board.setDescription(createBoardDTO.getDescription());
        board.setOwner(username);
        board.setMembers(new ArrayList<>(List.of(username)));
        board.setBackground(createBoardDTO.getBackground());
        board.setPublic(createBoardDTO.getIsPublic());  // Changed from isPublic() to getIsPublic()
        
        Board savedBoard = boardRepository.save(board);
        return modelMapper.map(savedBoard, BoardDTO.class);
    }

    public BoardDTO updateBoard(String boardId, UpdateBoardDTO updateBoardDTO, String username) {
        Board board = boardRepository.findById(boardId)
            .orElseThrow(() -> new ResourceNotFoundException("Board not found"));
        
        validateOwner(board, username);
        
        if (updateBoardDTO.getName() != null) board.setName(updateBoardDTO.getName());
        if (updateBoardDTO.getDescription() != null) board.setDescription(updateBoardDTO.getDescription());
        if (updateBoardDTO.getBackground() != null) board.setBackground(updateBoardDTO.getBackground());
        if (updateBoardDTO.getIsPublic() != null) board.setPublic(updateBoardDTO.getIsPublic());
        if (updateBoardDTO.getStarred() != null) board.setStarred(updateBoardDTO.getStarred());
        
        board.updateTimestamp();
        Board updatedBoard = boardRepository.save(board);
        return modelMapper.map(updatedBoard, BoardDTO.class);
    }

    public List<BoardDTO> getUserBoards(String userId) {
        List<Board> ownedBoards = boardRepository.findByOwner(userId);
        List<Board> memberBoards = boardRepository.findByMembersContaining(userId);
        
        return Stream.concat(ownedBoards.stream(), memberBoards.stream())
            .distinct()
            .map(board -> modelMapper.map(board, BoardDTO.class))
            .collect(Collectors.toList());
    }

    public BoardDTO getBoard(String boardId) {
        Board board = boardRepository.findById(boardId)
            .orElseThrow(() -> new ResourceNotFoundException("Board not found"));
        return modelMapper.map(board, BoardDTO.class);
    }

    public void deleteBoard(String boardId, String username) {
        Board board = boardRepository.findById(boardId)
            .orElseThrow(() -> new ResourceNotFoundException("Board not found"));
            
        validateOwner(board, username);
        boardRepository.deleteById(boardId);
    }

    public BoardDTO addMember(String boardId, String memberUsername, String requestingUsername) {
        Board board = boardRepository.findById(boardId)
            .orElseThrow(() -> new ResourceNotFoundException("Board not found"));
        
        // Only owner can add members
        validateOwner(board, requestingUsername);
        
        if (!board.getMembers().contains(memberUsername)) {
            board.getMembers().add(memberUsername);
            board = boardRepository.save(board);
        }
        
        return modelMapper.map(board, BoardDTO.class);
    }

    public BoardDTO removeMember(String boardId, String memberUsername, String requestingUsername) {
        Board board = boardRepository.findById(boardId)
            .orElseThrow(() -> new ResourceNotFoundException("Board not found"));
        
        // Only owner can remove members
        validateOwner(board, requestingUsername);
        
        if (board.getOwner().equals(memberUsername)) {
            throw new BadRequestException("Cannot remove the owner from the board");
        }
        
        board.getMembers().remove(memberUsername);
        board = boardRepository.save(board);
        
        return modelMapper.map(board, BoardDTO.class);
    }

    public BoardDTO addLabel(String boardId, LabelDTO labelDTO, String username) {
        Board board = boardRepository.findById(boardId)
            .orElseThrow(() -> new ResourceNotFoundException("Board not found"));
        
        validateOwner(board, username);
        
        Board.Label label = new Board.Label();
        label.setId(UUID.randomUUID().toString());
        label.setName(labelDTO.getName());
        label.setColor(labelDTO.getColor());
        
        board.getLabels().add(label);
        board.updateTimestamp();
        
        Board updatedBoard = boardRepository.save(board);
        return modelMapper.map(updatedBoard, BoardDTO.class);
    }

    public BoardDTO removeLabel(String boardId, String labelId, String username) {
        Board board = boardRepository.findById(boardId)
            .orElseThrow(() -> new ResourceNotFoundException("Board not found"));
        
        validateOwner(board, username);
        
        board.getLabels().removeIf(label -> label.getId().equals(labelId));
        board.updateTimestamp();
        
        Board updatedBoard = boardRepository.save(board);
        return modelMapper.map(updatedBoard, BoardDTO.class);
    }

    public BoardDTO toggleStarred(String boardId, String username) {
        Board board = boardRepository.findById(boardId)
            .orElseThrow(() -> new ResourceNotFoundException("Board not found"));
        
        if (!board.getMembers().contains(username)) {
            throw new BadRequestException("User is not a member of this board");
        }
        
        board.setStarred(!board.isStarred());
        board.updateTimestamp();
        
        Board updatedBoard = boardRepository.save(board);
        return modelMapper.map(updatedBoard, BoardDTO.class);
    }

    public boolean hasAccess(String boardId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Board board = boardRepository.findById(boardId)
            .orElseThrow(() -> new ResourceNotFoundException("Board not found"));
            
        // Users have access if:
        // 1. They are the owner
        // 2. They are a member
        // 3. The board is public
        return board.getOwner().equals(username) || 
               board.getMembers().contains(username) ||
               board.isPublic();
    }
}
