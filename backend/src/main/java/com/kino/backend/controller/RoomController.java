package com.kino.backend.controller;

import com.kino.backend.model.Room;
import com.kino.backend.repository.RoomRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@CrossOrigin
public class RoomController {

    private final RoomRepository roomRepository;


    public RoomController(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    @GetMapping
    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    @PostMapping
    public Room addRoom(@RequestBody Room room) { // Poprawiona nazwa metody
        return roomRepository.save(room);
    }
}