# fontreplacer

Pronounced /ˈfɒnt.ɹɪˈpleɪsɚ/

A Chrome extension for replacing any font with any font stack. Useful for Arial → Helvetica.

## How it works

1. Specify sets of fonts to target.
2. Specify what font stack to replace each set of targeted fonts with.

That's it!

## To-do

- [x] Many-to-many font mappings (instead of just many-to-one)
- [x] More user-friendly font replacement definitions
- [ ] Configuration export and import (should not be necessary thanks to `chrome.storage.sync` but what the heck)
- [x] Option to exclude elements with specified classes
- [x] Target elements based on actually rendered font instead of first font in stack
- [ ] Option to exclude specified sites/domains
