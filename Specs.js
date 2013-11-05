(function($)
{
    var callCount = 0;
    var expectedSettings;

    function assumeAjaxReturnsNothing()
    {
        spyOn($, "ajax").andCallFake(function()
        {
            var deferred = $.Deferred();
            deferred.resolve();
            return deferred.promise();
        });
    }

    function assumeAjaxReturnsSimpleObject()
    {
        spyOn($, "ajax").andCallFake(function()
        {
            var deferred = $.Deferred();
            deferred.resolve([{ Id: 1 }]);
            return deferred.promise();
        });
    }

    function assumeAjaxReturnsMixOfResponseAndErrors()
    {
        callCount = 0;
        spyOn($, "ajax").andCallFake(function()
        {
            callCount++;
            var deferred = $.Deferred();
            if (callCount % 2 === 0)
            {
                deferred.reject("Error");
            }
            else
            {
                deferred.resolve([{ Id: 1 }]);
            }
            return deferred.promise();
        });
    }

    function assumeExpectedSettingsAreInitialised()
    {
        if (expectedSettings)
        {
            return;
        }
        expectedSettings = $.extend({}, $.ajaxn.defaults);
        expectedSettings.global = false;
    }

    describe("jquery-ajaxn", function()
    {
        beforeEach(function()
        {
            this.addMatchers({
                toHaveSameMembersAs: function(source)
                {
                    var target = this.actual;
                    var missingMember;

                    this.message = function()
                    {
                        return "Expected " + target + " to have " + missingMember;
                    };

                    for (var member in source)
                    {
                        if (source.hasOwnProperty(member) && !target.hasOwnProperty(member))
                        {
                            missingMember = member;
                            return false;
                        }
                    }

                    return true;
                }
            });
        });

        it("Should extend jQuery with ajaxn method", function()
        {
            expect($.ajaxn).not.toBeUndefined();
            expect(typeof $.ajaxn).toEqual("function");
        });

        it("Should provide defaults object to allow changes", function()
        {
            expect($.ajaxn.defaults).not.toBeUndefined();
            expect(typeof $.ajaxn.defaults).toEqual("object");
        });

        it("Should include same defaults as ajax", function()
        {
            expect($.ajaxn.defaults).toHaveSameMembersAs($.ajaxSettings);
        });

        it("Should allow setting maximum requests with default of 0 to indicate no limit", function()
        {
            expect($.ajaxn.defaults.maxRequests).not.toBeUndefined();
            expect($.ajaxn.defaults.maxRequests).toEqual(0);
        });

        it("Should support callback to support pre processing request with default of empty anonymous function", function()
        {
            expect($.ajaxn.defaults.requesting).not.toBeUndefined();
            expect(typeof $.ajaxn.defaults.requesting).toEqual("function");
        });

        it("Should support callback to process data with default of empty anonymous function", function()
        {
            expect($.ajaxn.defaults.received).not.toBeUndefined();
            expect(typeof $.ajaxn.defaults.received).toEqual("function");
        });

        it("Should support callback on error during request with default of empty anonymous function", function()
        {
            expect($.ajaxn.defaults.failed).not.toBeUndefined();
            expect(typeof $.ajaxn.defaults.failed).toEqual("function");
        });

        it("Should support callback on completion with default of empty anonymous function", function()
        {
            expect($.ajaxn.defaults.completed).not.toBeUndefined();
            expect(typeof $.ajaxn.defaults.completed).toEqual("function");
        });

        it("Should stop if no data returned by request", function()
        {
            assumeAjaxReturnsNothing();

            $.ajaxn();

            expect($.ajax).toHaveBeenCalled();
            expect($.ajax.callCount).toEqual(1);
        });

        it("Should stop requesting if response is an empty array", function()
        {
            assumeAjaxReturnsNothing();

            $.ajaxn();

            expect($.ajax).toHaveBeenCalled();
            expect($.ajax.callCount).toEqual(1);
        });

        it("Should use defaults if options not provided on call", function()
        {
            assumeExpectedSettingsAreInitialised();
            assumeAjaxReturnsNothing();

            $.ajaxn();

            expect($.ajax).toHaveBeenCalled();
            expect($.ajax.mostRecentCall.args[0]).toEqual(expectedSettings);
        });

        it("Should merge options with settings used in ajax request", function()
        {
            assumeExpectedSettingsAreInitialised();
            var options = { url: "/SomeController/SomeAction", type: "POST" };
            assumeAjaxReturnsNothing();

            $.ajaxn(options);

            expect($.ajax).toHaveBeenCalled();
            expect($.ajax.mostRecentCall.args[0]).toEqual($.extend({}, expectedSettings, options));
        });

        it("Should ensure global is set to false on options provided", function()
        {
            var options = { url: "/SomeController/SomeAction", type: "POST", global: true };
            assumeAjaxReturnsNothing();

            $.ajaxn(options);

            expect($.ajax.mostRecentCall.args[0].global).toEqual(false);
        });

        it("Should remove any standard ajax callback handlers from options provided", function()
        {
            var options = {
                url: "/SomeController/SomeAction",
                success: function()
                {
                },
                error: function()
                {
                },
                beforeSend: function()
                {
                },
                complete: function()
                {
                }
            };
            assumeAjaxReturnsNothing();

            $.ajaxn(options);

            expect($.ajax.mostRecentCall.args[0].success).toBeUndefined();
            expect($.ajax.mostRecentCall.args[0].error).toBeUndefined();
            expect($.ajax.mostRecentCall.args[0].beforeSend).toBeUndefined();
            expect($.ajax.mostRecentCall.args[0].complete).toBeUndefined();
        });

        it("Should only submit fixed number of requests when limit specified", function()
        {
            var options = { url: "/SomeController/SomeAction", type: "POST", maxRequests: 10 };
            assumeAjaxReturnsSimpleObject();

            $.ajaxn(options);

            expect($.ajax).toHaveBeenCalled();
            expect($.ajax.callCount).toEqual(options.maxRequests);
        });

        it("Should execute requesting callback before each request", function()
        {
            callCount = 0;
            var options = {
                url: "/SomeController/SomeAction",
                maxRequests: 5,
                requesting: function()
                {
                    callCount++;
                }
            };
            assumeAjaxReturnsSimpleObject();

            $.ajaxn(options);

            expect(callCount).toEqual(options.maxRequests);
        });

        it("Should support cancel during requesting callback", function()
        {
            callCount = 0;
            var args;
            var options = {
                url: "/SomeController/SomeAction",
                maxRequests: 5,
                requesting: function(cancelable)
                {
                    args = cancelable;
                    callCount++;
                    if (callCount === 2)
                    {
                        cancelable.cancel = true;
                    }
                }
            };
            assumeAjaxReturnsSimpleObject();

            $.ajaxn(options);

            expect(args.cancel).not.toBeUndefined();
            expect(callCount).toEqual(2);
        });

        it("Should provide settings for next ajax call during requesting", function()
        {
            var settings;
            var options = {
                url: "/SomeController/SomeAction",
                maxRequests: 5,
                requesting: function(cancelable)
                {
                    settings = cancelable.settings;
                    cancelable.cancel = true;
                }
            };
            assumeAjaxReturnsSimpleObject();

            $.ajaxn(options);

            expect(settings).not.toBeUndefined();
        });

        it("Should execute received callback after each response when data returned", function()
        {
            var responses = [];
            var options = {
                url: "/SomeController/SomeAction",
                maxRequests: 5,
                received: function(response)
                {
                    responses.push(response);
                }
            };
            assumeAjaxReturnsSimpleObject();

            $.ajaxn(options);

            expect(responses).toBeTruthy();
            expect(responses.length).toEqual(5);
        });

        it("Should execute failed callback after each failed request", function()
        {
            var errors = [];
            var options = {
                url: "/SomeController/SomeAction",
                maxRequests: 5,
                failed: function(error)
                {
                    errors.push(error);
                }
            };
            assumeAjaxReturnsMixOfResponseAndErrors();

            $.ajaxn(options);

            expect(errors.length).toEqual(2);
        });

        it("Should execute completed callback when finished including status report with success, error and request counts", function()
        {
            var statusReport;
            var responses = [];
            var errors = [];
            var options = {
                url: "/SomeController/SomeAction",
                maxRequests: 5,
                received: function(response)
                {
                    responses.push(response);
                },
                failed: function(error)
                {
                    errors.push(error);
                },
                completed: function(status)
                {
                    statusReport = status;
                }
            };
            assumeAjaxReturnsMixOfResponseAndErrors();

            $.ajaxn(options);

            expect(statusReport).toBeTruthy();
            expect(statusReport.succeeded).not.toBeUndefined();
            expect(statusReport.succeeded).toEqual(responses.length);
            expect(statusReport.failed).not.toBeUndefined();
            expect(statusReport.failed).toEqual(errors.length);
            expect(statusReport.requests).not.toBeUndefined();
            expect(statusReport.requests).toEqual(errors.length + responses.length);
        });
    });
})(jQuery);