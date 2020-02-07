# How to debug Security Rules

1. Look for `[GENS]` message, copy the path to the simulator (Database -> Rules)
2. Double-check if the path is correct (!) - is it pointing to parent or child? Add child path if necessary
3. Serialize payload with `JSON.stringify(temp1, null, "  ")` and copy to simulator
4. Set user in simulator to the value of `this.$models.user.defaultUserId`
5. Check why permission was denied
6. Check if check `database.rules.json` makes sense (and was correctly compiled)
7. Check if check `database.rules.bolt` is correct

Also, see [Tips](./security-rules-tips).
