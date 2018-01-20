# Text Game SMS protocol

All SMS messages are sent as base64 encoded JSON in the following format:

## Client starts game
### (client->server)
```
{
  "event_type": "new_game"
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
  "event_type": "register"
}
```

## Server informs client of successful registration
### (server->client)
```
{
  "event_type": "registration_ok"
}
```

## Server informs clients game has begun
### (server->client)
```
{
  "timestamp": 1516425738,
  "event_type": "game_starting",
  "player_numbers": ["7782350067", "7788728011"],
  "capture_points": [
    {
      "latitude": -32.523,
      "longitude": 134.133,
      "point": 0
    },
    {
      "latitude": -32.513,
      "longitude": 134.143,
      "point": 1
    }
  ],
  "enemy_spawns": [
    {"point": 0, "timestamp": 1516425838}
  ]
}
```

## Position update
### (client->client)
```
{
  "timestamp": 1516425738,
  "event_type": "position_update",
  "player_number": "7782350067",
  "latitude": -37.813,
  "longitude": 144.962
}
```

## Upon starting to capture a point
### (client->client)
```
{
  "timestamp": 1516425738,
  "event_type": "start_capture",
  "capture_point": 0
}
```

## Upon successfuly capturing a point
### (client->client)
```
{
  "timestamp": 1516425738,
  "event_type": "point_captured",
  "capture_point": 0
}
```

## Upon leaving a capture point without capturing it
### (client->client)
```
{
  "timestamp": 1516425738,
  "event_type": "left_capture_point",
  "capture_point": 0
}
```

## Upon defeating an enemy at a point (client->client)
### (client->client)
```
{
  "timestamp": 1516425738,
  "event_type": "defeat_enemy",
  "capture_point": 0
}
```

## Upon being downed
### (client->client)
```
{
  "timestamp": 1516425738,
  "event_type": "downed"
}
```

## Upon reviving a player
### (client->client)
```
{
  "timestamp": 1516425738,
  "event_type": "revived_player"
}
```