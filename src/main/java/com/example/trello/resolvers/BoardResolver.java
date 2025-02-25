package com.example.trello.resolvers;

import com.example.trello.services.BoardService;
import com.example.trello.dtos.BoardDTO;
import com.example.trello.dtos.CreateBoardDTO;
import com.example.trello.dtos.UpdateBoardDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class BoardResolver {
    private final BoardService boardService;

    @QueryMapping
    public BoardDTO board(@Argument String id) {
        return boardService.getBoard(id);
    }

    @QueryMapping
    public List<BoardDTO> userBoards() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return boardService.getUserBoards(username);
    }

    @MutationMapping
    public BoardDTO createBoard(@Argument CreateBoardDTO input) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return boardService.createBoard(input, username);
    }

    @MutationMapping
    public BoardDTO updateBoard(@Argument String id, @Argument UpdateBoardDTO input) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return boardService.updateBoard(id, input, username);
    }

    @MutationMapping
    public boolean deleteBoard(@Argument String id) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        boardService.deleteBoard(id, username);
        return true;
    }

    @MutationMapping
    public BoardDTO addBoardMember(@Argument String boardId, @Argument String username) {
        String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();
        return boardService.addMember(boardId, username, currentUser);
    }

    @MutationMapping
    public BoardDTO removeBoardMember(@Argument String boardId, @Argument String username) {
        String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();
        return boardService.removeMember(boardId, username, currentUser);
    }
}
