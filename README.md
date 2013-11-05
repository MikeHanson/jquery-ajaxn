jquery-ajaxn
============

Extends jQuery to provide an ajaxn function, which makes repeated ajax calls until no data is returned.

The plugin was created to support chunking of data and was originally called jquery-chunk, but the name was changed once it became clear it was not limited to chunking and might be useful in other scenarios.

Usage: $.ajaxn([options:Object]);

$.ajaxn.defaults
Is provided to support changing the default settings used.  These default to the current $.ajaxSettings values with additions that correspond to the options that can be passed to $.ajaxn.

Options:
maxRequests:number - Maximum number of ajax calls that should be made, defaults to 0 indicating no limit, will stop if a request returns nothing or an empty array regardless

requesting:function - Callback to be made before each ajax request, passes {cancel: false, settings: settings:Object} where settings is the settings object that will be passed to the next ajax call.  Set cancel to true to cancel all further requests

received:function - Callback to made after each successful ajax request, passes data returned by ajax.

failed:function - Callback to made after each failed ajax request, passes the error

completed:function - Callback to be made after all requests have been processed, passes status report in the form { requests: n, succeeded: n, failed: n }

Important!!
ajax is executed with global=false so any global error handling or setup is ignored.
Any of the standard ajax callback handlers that are set on the options object passed to ajaxn are deleted before execution, you must used the callback handlers mentioned above.


Feel free to make any constructive criticism or suggestions and/or submit pull requestss with suggested changes/improvements.  We are just starting to use this in the system it was developed for there may be some changes to come.

Once it is table a NuGet package will be created and published.  

