(function($)
{
    $.ajaxn = function(options)
    {
        var lastResponse;
        var requestCount = 0;
        var failCount = 0;
        var successCount = 0;
        var settings = $.extend({}, $.ajaxn.defaults, options);

        settings.global = false;
        delete settings.beforeSend;
        delete settings.complete;
        delete settings.error;
        delete settings.success;
        
        while (shouldSubmitRequest())
        {
            var cancelable = { cancel: false, settings: settings };
            settings.requesting(cancelable);
            if (cancelable.cancel === true)
            {
                break;
            }
            $.ajax(settings).done(handleDone).fail(handleFail);
            requestCount++;
        }

        settings.completed({requests: requestCount,  succeeded: successCount, failed: failCount });
        
        function handleFail(error)
        {
            failCount++;
            settings.failed(error);
        }
        
        function handleDone(data)
        {
            if (data)
            {
                lastResponse = data;
                successCount++;
                settings.received(data);
            }
        };
        
        function shouldSubmitRequest()
        {
            return requestCount === 0 || (!lastResponseWasNothing() && !hasReachedMaxRequestLimit());
        }
        
        function lastResponseWasNothing()
        {
            return !lastResponse || (lastResponse.length != "undefined" && lastResponse.length === 0);
        }
        
        function hasReachedMaxRequestLimit()
        {
            return settings.maxRequests !== 0 && requestCount >= settings.maxRequests;
        }
    };

    $.ajaxn.defaults = $.extend({
        maxRequests: 0,
        requesting: function()
        {
        },
        received: function()
        {
        },
        failed: function()
        {
        },
        completed: function()
        {
        }
    }, $.ajaxSettings);
})(jQuery);