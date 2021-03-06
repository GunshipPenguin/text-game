# Text Game SMS protocol

All SMS messages are sent as base64 encoded zlib compressed JSON in the
following format:

## Client opens game lobby
### (client->server)
```
{
  "event_type": "open_lobby"
}
```

## Server informs client new game successfuly started
### (server->client)
```
{
  "event_type": "game_lobby_started"
}
```

## Client registers with server
### (client->server)
```
{
  "event_type": "register",
  "host_number": "7782350067"
}
```

## Server informs clients of new player in lobby
### (server->client)
```
{
  "event_type": "new_registration",
  "players_in_lobby": ["7782350067", "7788728011"]
}
```

## Client starts game
### (client->server)
```
{
  "event_type": "start_game"
}
```

## Server informs clients game has begun
### (server->client)
```
{
  "timestamp": 1516425738,
  "event_type": "game_starting",
  "player_numbers": ["7782350067", "7788728011"],
  "treasure_spawns": [
    {"latitude": -142.132, "longitude": 32.233 "timestamp": 1516425838}
  ],
  "game_end": 1516426738
}
```

## Chat message
### (client->client)
```
{
  "event_type": "chat_message",
  "message": "This is a message"
}
```

## Position update
### (client->client)
```
{
  "timestamp": 1516425738,
  "event_type": "position_update",
  "latitude": -37.813,
  "longitude": 144.962
}
```

## Capture treasure
### (client->client)
```
{
  "timestamp": 1516425738,
  "event_type": "capture_treasure",
  "treasure_number": 2
}
```