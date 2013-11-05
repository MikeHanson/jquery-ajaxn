jquery-ajaxn
============

Extends jQuery to provide an ajaxn function, which makes repeated ajax calls until no data is returned.

The plugin was created to support chunking of data and was originally called jquery-chunk, but the name was changed once it became clear it was not limited to chunking and might be useful in other scenarios.

Usage: $.ajaxn([options:Object]);

$.ajaxn.defaults
Is provided to support changing the default settings used.  These default to the current $.ajaxSettings values with additions that correspond to the options that can be passed to $.ajaxn.

Options:

