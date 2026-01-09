# /scripts

Files in the script folder should be called from the top level menu
via the scripts command, using

```bash
script <filename>.oets
```

When ran, the script will automate commands in the terminal. Script
files should not be checked into git, but can be shared between
users.

It should be noted that private keys and other private data should
not be stored in scripts. Please store these variables in your
local `.env` file.

