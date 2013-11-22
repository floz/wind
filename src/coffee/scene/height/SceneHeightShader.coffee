class SceneHeightShader

    uniforms: {
        "uText": { type: "t", value: null }
    }

    vertexShader: [

        "uniform sampler2D uText;"

        "varying vec2 vUv;"

        "void main() {"

            # "vec2 uv = position.xy / 512.0;"
            "vec4 data = texture2D( uText, uv );"
            "vec4 pos = vec4( position, 1.0 );"
            "pos.x += data.x * 100.0;"
            "pos.y += data.y * 100.0;"

            "vUv = uv;"

            "vec4 mvPosition = modelViewMatrix * pos;"

            "gl_Position = projectionMatrix * mvPosition;"

        "}"

    ].join( "\n" )

    fragmentShader: [

        "uniform sampler2D uText;"

        "varying vec2 vUv;"

        "void main() {"

            "gl_FragColor = vec4( texture2D( uText, vUv ).rgb, 1.0 );",

        "}"

    ].join( "\n" )
