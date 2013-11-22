class StageSingleton

    class StageInstance

        lastMouse: null
        mouse: null
        size: null

        _$window: null

        constructor: ->
            @lastMouse = { x: 0.0, y: 0.0 }
            @mouse = { x: 0.0, y: 0.0 }
            @size = { w: 0, h: 0 }
            @_$window = $( window )

            $( document ).on "mousemove", @_onMouseMove

            @_$window.on "resize", @_onResize
            @_onResize()

        _onMouseMove: ( e ) =>
            @lastMouse.x = @mouse.x
            @lastMouse.y = @mouse.y
            @mouse.x = e.clientX
            @mouse.y = e.clientY

        _onResize: ( e ) =>
            @size.w = @_$window.width()
            @size.h = @_$window.height()

    instance = null
    @get: -> instance ?= new StageInstance()

stage = StageSingleton.get()
