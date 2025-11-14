# Game Data Files

This directory contains data files used by the games in Chair44.

## chair-or-swear-words.json

Contains word lists for the "Chair or Swear" game.

### Structure

```json
{
  "chairs": [...],      // Array of chair type names
  "swears": [...],      // Array of swear words
  "metadata": {...}     // Metadata about the word lists
}
```

### How to Add Words

#### Adding Chair Types

Add new chair names to the `chairs` array:

```json
"chairs": [
  "Armchair",
  "Rocking Chair",
  "Your New Chair Type"  // Add here
]
```

**Tips for good chair words:**
- Use real chair type names
- Include both common (Armchair) and obscure (Sgabello) types
- Proper nouns for famous chairs (Eames Lounge, Barcelona Chair)
- Mix easy and difficult words for variety

#### Adding Swear Words

Add new swear words to the `swears` array:

```json
"swears": [
  "Damn",
  "Hell",
  "Your New Swear"  // Add here
]
```

**Tips for good swear words:**
- Keep it appropriate for general audiences
- Include mild to moderate swears
- Mix different types (British, American, euphemisms)
- Avoid anything too offensive

### Updating Metadata

After modifying the lists, update the metadata:

```json
"metadata": {
  "version": "1.1",                    // Increment version
  "lastUpdated": "2025-11-14",         // Update date
  "chairCount": 45,                    // Update count
  "swearCount": 35,                    // Update count
  "difficulty": "mixed",
  "notes": "Your notes about changes"
}
```

### Game Balance

For the best gameplay experience:
- Keep roughly similar numbers of chairs and swears
- Mix easy and difficult words
- Include words that might be confusing (e.g., "Chesterfield" could sound like a swear!)
- Test new words in the game to ensure they work well

### Examples of Good Additions

**Confusing Chairs (Advanced):**
- Chesterfield (sounds British and fancy)
- Bergère (French, sounds unusual)
- Sgabello (Italian Renaissance chair)
- Farthingale (Tudor-era chair)

**Mild Swears:**
- Dagnabbit
- Blasted
- Confound it
- Son of a gun

### File Format

- Must be valid JSON
- Use double quotes for strings
- No trailing commas
- Maintain alphabetical order (optional but recommended)

### Testing Your Changes

After modifying the file:
1. Ensure JSON is valid (check syntax)
2. Restart the dev server if needed
3. Play the game to test new words
4. Make sure words display correctly
5. Check that difficulty feels balanced

### Future Enhancements

Ideas for extending this data:
- Add difficulty ratings for each word
- Add categories (e.g., modern vs antique chairs)
- Add hints or definitions
- Multiple language support
- Regional variations

