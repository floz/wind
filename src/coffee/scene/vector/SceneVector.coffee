class SceneVector

    _canvas: null
    _ctx: null
    _size: 0

    _sizeTile: 0
    _step: 32 

    _vectors: null

    constructor: ->
        @_canvas = document.getElementById "wind_vector"
        @_ctx = @_canvas.getContext "2d"
        @_size = @_canvas.width

        @_sizeTile = @_size / @_step

        @_createVectors()

    _createVectors: ->
        @_vectors = []

        mid = @_sizeTile >> 1
        px = 0
        py = 0
        for i in [ 0..@_step ]
            for j in [ 0..@_step ]
                @_vectors.push new Vector px + mid, py + mid
                px += @_sizeTile

            px = 0
            py += @_sizeTile

        return

    update: ->
        @_updateVector()

        @_ctx.fillStyle = "#000"
        @_ctx.fillRect 0, 0, @_size, @_size

        @_drawGrid()
        @_drawVector()

    _updateVector: ->
        dx = stage.mouse.x - stage.lastMouse.x
        dy = stage.mouse.y - stage.lastMouse.y
        orientation = Math.atan2 dy, dx
        length = Math.sqrt dx * dx + dy * dy
        
        for vector, i in @_vectors
            dx = stage.mouse.x - vector.x
            dy = stage.mouse.y - vector.y
            dist = Math.sqrt dx * dx + dy * dy
            ratio = Math.max 0, Math.min( dist / 100, 1 )
            ratio = @_bellCurve ratio * 2

            vector.add orientation, length, ratio
            vector.update()

        return

    _bellCurve: ( value ) ->
        f = ( value / 2 ) * 1.5
        if ( f > - 1.5 && f < -0.5 )
            return 0.5 * Math.pow( f + 1.5, 2.0 )
        else if ( f > -0.5 && f < 0.5 )
            return 3.0 / 4.0 - ( f * f )
        else if ( f > 0.5 && f < 1.5 )
            return 0.5 * Math.pow( f - 1.5, 2.0 )
        return 0.0

    _drawGrid: ->
        idx = 0

        @_ctx.strokeStyle = "#444"
        @_ctx.beginPath()
        for i in [ 0..@_step ]
            @_ctx.moveTo 0, idx
            @_ctx.lineTo @_size, idx

            @_ctx.moveTo idx, 0
            @_ctx.lineTo idx, @_size

            idx += @_sizeTile
        @_ctx.stroke()

    _drawVector: ->
        @_ctx.strokeStyle = "#f00"
        @_ctx.beginPath()
        for vector in @_vectors
            @_ctx.moveTo vector.x, vector.y
            @_ctx.lineTo vector.getDirection().x, vector.getDirection().y
        @_ctx.stroke()

class Vector

    x: 0
    y: 0

    orientation: 0.0
    length: 0.0

    direction: { x: 0.0, y: 0.0 }

    _needUpdate: true

    constructor: ( @x, @y ) ->

    add: ( orientation, length, ratio ) ->
        @orientation += ( orientation - @orientation ) * ratio
        @length += ( length - @length ) * ratio

        @_needUpdate = true

    update: ->
        @length += ( 0.0 - @length ) * .07

    getDirection: ->
        return @direction if not @_needUpdate

        @direction.x = @x + Math.cos( @orientation ) * @length
        @direction.y = @y + Math.sin( @orientation ) * @length

        @direction.x = @x + 1 if @direction.x == @x && @direction.y == @y

        @direction
