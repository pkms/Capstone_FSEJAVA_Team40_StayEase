package com.capstone.team40.controller;

import com.capstone.team40.entity.Room;
import com.capstone.team40.model.UpdateRoomRequest;
import com.capstone.team40.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping(path = "/api/rooms")
public class RoomController
{
    @Autowired
    private RoomService roomService;

    @PutMapping("/{id}/update")
    public ResponseEntity<String> updateRoom(@RequestBody UpdateRoomRequest updateRoomRequest, @PathVariable("id") UUID uuid)
    {
        Room updatedRoom = this.roomService.updateRoom(updateRoomRequest, uuid);
        return updatedRoom == null ? ResponseEntity.badRequest().body("Room with given Id does not exists !") : ResponseEntity.ok().body("Room details updated successfully !");
    }

    @DeleteMapping("/{id}/delete")
    public ResponseEntity<String> deleteRoom(@PathVariable("id") UUID uuid)
    {
        this.roomService.deleteRoom(uuid);
        return ResponseEntity.ok().body("Room deleted successfully !");
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<String> toggleStatus(@PathVariable("id") UUID uuid, @RequestParam("active") boolean active)
    {
        Room toggledRoom = this.roomService.toggleStatus(uuid, active);
        return toggledRoom == null ? ResponseEntity.badRequest().body("Room with given Id does not exists !") : ResponseEntity.ok().body("Room status toggled successfully !");
    }
}
