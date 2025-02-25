package com.example.trello.resolvers;

import com.example.trello.services.ListService;
import com.example.trello.dtos.ListDTO;
import com.example.trello.dtos.CreateListDTO;
import com.example.trello.dtos.UpdateListDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.stereotype.Controller;

import java.util.ArrayList;
import java.util.List;

@Controller
@RequiredArgsConstructor
public class ListResolver {
    private final ListService listService;

    @QueryMapping
    public List<ListDTO> listsByBoard(@Argument String boardId) {
        return listService.getAllListsByBoardId(boardId);
    }

    @QueryMapping
    public List<ListDTO> archivedLists(@Argument String boardId) {
        return listService.getArchivedLists(boardId);
    }

    @MutationMapping
    public ListDTO createList(@Argument("input") CreateListDTO input) {
        return listService.createList(input);
    }

    @MutationMapping
    public ListDTO updateList(
        @Argument String id, 
        @Argument("input") UpdateListDTO input
    ) {
        return listService.updateList(id, input);
    }

    @MutationMapping
    public boolean deleteList(@Argument String id) {
        listService.deleteList(id);
        return true;
    }

    @MutationMapping
    public ListDTO toggleListArchived(@Argument String id) {
        return listService.toggleArchived(id);
    }

    @MutationMapping
    public ListDTO toggleListSubscription(@Argument String id) {
        return listService.toggleSubscription(id);
    }

    @SchemaMapping(typeName = "List")
    public List<String> subscribedUsers(ListDTO list) {
        return list.getSubscribedUsers() != null ? 
               list.getSubscribedUsers() : 
               new ArrayList<>();
    }

}
