var SceneVector, Vector;

SceneVector = (function() {
  SceneVector.prototype._canvas = null;

  SceneVector.prototype._ctx = null;

  SceneVector.prototype._size = 0;

  SceneVector.prototype._sizeTile = 0;

  SceneVector.prototype._step = 32;

  SceneVector.prototype._vectors = null;

  function SceneVector() {
    this._canvas = document.getElementById("wind_vector");
    this._ctx = this._canvas.getContext("2d");
    this._size = this._canvas.width;
    this._sizeTile = this._size / this._step;
    this._createVectors();
  }

  SceneVector.prototype._createVectors = function() {
    var i, j, mid, px, py, _i, _j, _ref, _ref1;
    this._vectors = [];
    mid = this._sizeTile >> 1;
    px = 0;
    py = 0;
    for (i = _i = 0, _ref = this._step; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
      for (j = _j = 0, _ref1 = this._step; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; j = 0 <= _ref1 ? ++_j : --_j) {
        this._vectors.push(new Vector(px + mid, py + mid));
        px += this._sizeTile;
      }
      px = 0;
      py += this._sizeTile;
    }
  };

  SceneVector.prototype.update = function() {
    this._updateVector();
    this._ctx.fillStyle = "#000";
    this._ctx.fillRect(0, 0, this._size, this._size);
    this._drawGrid();
    return this._drawVector();
  };

  SceneVector.prototype._updateVector = function() {
    var dist, dx, dy, i, length, orientation, ratio, vector, _i, _len, _ref;
    dx = stage.mouse.x - stage.lastMouse.x;
    dy = stage.mouse.y - stage.lastMouse.y;
    orientation = Math.atan2(dy, dx);
    length = Math.sqrt(dx * dx + dy * dy);
    _ref = this._vectors;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      vector = _ref[i];
      dx = stage.mouse.x - vector.x;
      dy = stage.mouse.y - vector.y;
      dist = Math.sqrt(dx * dx + dy * dy);
      ratio = Math.max(0, Math.min(dist / 100, 1));
      ratio = this._bellCurve(ratio * 2);
      vector.add(orientation, length, ratio);
      vector.update();
    }
  };

  SceneVector.prototype._bellCurve = function(value) {
    var f;
    f = (value / 2) * 1.5;
    if (f > -1.5 && f < -0.5) {
      return 0.5 * Math.pow(f + 1.5, 2.0);
    } else if (f > -0.5 && f < 0.5) {
      return 3.0 / 4.0 - (f * f);
    } else if (f > 0.5 && f < 1.5) {
      return 0.5 * Math.pow(f - 1.5, 2.0);
    }
    return 0.0;
  };

  SceneVector.prototype._drawGrid = function() {
    var i, idx, _i, _ref;
    idx = 0;
    this._ctx.strokeStyle = "#444";
    this._ctx.beginPath();
    for (i = _i = 0, _ref = this._step; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
      this._ctx.moveTo(0, idx);
      this._ctx.lineTo(this._size, idx);
      this._ctx.moveTo(idx, 0);
      this._ctx.lineTo(idx, this._size);
      idx += this._sizeTile;
    }
    return this._ctx.stroke();
  };

  SceneVector.prototype._drawVector = function() {
    var vector, _i, _len, _ref;
    this._ctx.strokeStyle = "#f00";
    this._ctx.beginPath();
    _ref = this._vectors;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      vector = _ref[_i];
      this._ctx.moveTo(vector.x, vector.y);
      this._ctx.lineTo(vector.getDirection().x, vector.getDirection().y);
    }
    return this._ctx.stroke();
  };

  return SceneVector;

})();

Vector = (function() {
  Vector.prototype.x = 0;

  Vector.prototype.y = 0;

  Vector.prototype.orientation = 0.0;

  Vector.prototype.length = 0.0;

  Vector.prototype.direction = {
    x: 0.0,
    y: 0.0
  };

  Vector.prototype._needUpdate = true;

  function Vector(x, y) {
    this.x = x;
    this.y = y;
  }

  Vector.prototype.add = function(orientation, length, ratio) {
    this.orientation += (orientation - this.orientation) * ratio;
    this.length += (length - this.length) * ratio;
    return this._needUpdate = true;
  };

  Vector.prototype.update = function() {
    return this.length += (0.0 - this.length) * .07;
  };

  Vector.prototype.getDirection = function() {
    if (!this._needUpdate) {
      return this.direction;
    }
    this.direction.x = this.x + Math.cos(this.orientation) * this.length;
    this.direction.y = this.y + Math.sin(this.orientation) * this.length;
    if (this.direction.x === this.x && this.direction.y === this.y) {
      this.direction.x = this.x + 1;
    }
    return this.direction;
  };

  return Vector;

})();

var SceneHeight;

SceneHeight = (function() {
  SceneHeight.prototype._canvas = null;

  SceneHeight.prototype._ctx = null;

  SceneHeight.prototype._textDisplacement = null;

  SceneHeight.prototype._textTest = null;

  SceneHeight.prototype._textW = 0;

  SceneHeight.prototype._textH = 0;

  SceneHeight.prototype._orientation = 0.0;

  SceneHeight.prototype._renderer = null;

  SceneHeight.prototype._camera = null;

  SceneHeight.prototype._scene = null;

  SceneHeight.prototype._plane = null;

  SceneHeight.prototype._uniforms = null;

  SceneHeight.prototype._texture = null;

  SceneHeight.prototype._size = 512;

  function SceneHeight() {
    this._canvas = document.getElementById("wind_height_map");
    this._ctx = this._canvas.getContext("2d");
    this._textDisplacement = document.getElementById("texture--displacement");
    this._textTest = document.getElementById("texture--test");
    this._textW = this._textDisplacement.width;
    this._textH = this._textDisplacement.height;
    this._ctx.fillStyle = "rgba( 128, 128, 128, 1 )";
    this._ctx.fillRect(0, 0, this._size, this._size);
    this._initScene3D();
  }

  SceneHeight.prototype._initScene3D = function() {
    var ambient, container, geom, mat;
    this._renderer = new THREE.WebGLRenderer({
      alpha: false
    });
    this._renderer.setClearColor(0x444444);
    this._renderer.setSize(512, 512);
    container = document.getElementById("wind_height_map_3d");
    container.appendChild(this._renderer.domElement);
    this._camera = new THREE.PerspectiveCamera(45, 1, 1, 10000);
    this._camera.position.set(0, 0, 0);
    this._scene = new THREE.Scene();
    ambient = new THREE.AmbientLight(0x0000ff);
    this._scene.add(ambient);
    geom = new THREE.PlaneGeometry(512, 512, 10, 10);
    mat = this._getMaterial();
    this._plane = new THREE.Mesh(geom, mat);
    this._plane.position.z = -1000;
    return this._scene.add(this._plane);
  };

  SceneHeight.prototype._getMaterial = function() {
    var params, shader;
    shader = new SceneHeightShader();
    this._uniforms = shader.uniforms;
    params = {
      fragmentShader: shader.fragmentShader,
      vertexShader: shader.vertexShader,
      uniforms: this._uniforms
    };
    this._texture = new THREE.Texture(this._canvas);
    this._uniforms.uText.value = this._texture;
    return new THREE.ShaderMaterial(params);
  };

  SceneHeight.prototype.update = function() {
    var dx, dy, length, lmx, lmy, mx, my, orientation;
    lmx = stage.lastMouse.x - 512;
    lmy = stage.lastMouse.y;
    mx = stage.mouse.x - 512;
    my = stage.mouse.y;
    dx = mx - lmx;
    dy = my - lmy;
    orientation = Math.atan2(dy, dx);
    length = Math.sqrt(dx * dx + dy * dy);
    this._orientation = orientation;
    this._ctx.drawImage(this._canvas, 0, 0);
    this._ctx.fillStyle = "rgba( 128, 128, 128, 1 )";
    this._ctx.fillRect(0, 0, this._size, this._size);
    this._ctx.save();
    this._ctx.translate(mx, my);
    this._ctx.drawImage(this._textDisplacement, -this._textW >> 1, -this._textH >> 1);
    this._ctx.restore();
    this._texture.needsUpdate = true;
    return this._renderer.render(this._scene, this._camera);
  };

  return SceneHeight;

})();

var SceneHeightShader;

SceneHeightShader = (function() {
  function SceneHeightShader() {}

  SceneHeightShader.prototype.uniforms = {
    "uText": {
      type: "t",
      value: null
    }
  };

  SceneHeightShader.prototype.vertexShader = ["uniform sampler2D uText;", "varying vec2 vUv;", "void main() {", "vec4 data = texture2D( uText, uv );", "vec4 pos = vec4( position, 1.0 );", "pos.x += data.x * 100.0;", "pos.y += data.y * 100.0;", "vUv = uv;", "vec4 mvPosition = modelViewMatrix * pos;", "gl_Position = projectionMatrix * mvPosition;", "}"].join("\n");

  SceneHeightShader.prototype.fragmentShader = ["uniform sampler2D uText;", "varying vec2 vUv;", "void main() {", "gl_FragColor = vec4( texture2D( uText, vUv ).rgb, 1.0 );", "}"].join("\n");

  return SceneHeightShader;

})();

var StageSingleton, stage,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

StageSingleton = (function() {
  var StageInstance, instance;

  function StageSingleton() {}

  StageInstance = (function() {
    StageInstance.prototype.lastMouse = null;

    StageInstance.prototype.mouse = null;

    StageInstance.prototype.size = null;

    StageInstance.prototype._$window = null;

    function StageInstance() {
      this._onResize = __bind(this._onResize, this);
      this._onMouseMove = __bind(this._onMouseMove, this);
      this.lastMouse = {
        x: 0.0,
        y: 0.0
      };
      this.mouse = {
        x: 0.0,
        y: 0.0
      };
      this.size = {
        w: 0,
        h: 0
      };
      this._$window = $(window);
      $(document).on("mousemove", this._onMouseMove);
      this._$window.on("resize", this._onResize);
      this._onResize();
    }

    StageInstance.prototype._onMouseMove = function(e) {
      this.lastMouse.x = this.mouse.x;
      this.lastMouse.y = this.mouse.y;
      this.mouse.x = e.clientX;
      return this.mouse.y = e.clientY;
    };

    StageInstance.prototype._onResize = function(e) {
      this.size.w = this._$window.width();
      return this.size.h = this._$window.height();
    };

    return StageInstance;

  })();

  instance = null;

  StageSingleton.get = function() {
    return instance != null ? instance : instance = new StageInstance();
  };

  return StageSingleton;

}).call(this);

stage = StageSingleton.get();

var Main,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Main = (function() {
  Main.prototype._sceneHeight = null;

  Main.prototype._sceneVector = null;

  function Main() {
    this._update = __bind(this._update, this);
    this._sceneHeight = new SceneHeight();
    this._sceneVector = new SceneVector();
    this._update();
  }

  Main.prototype._update = function() {
    this._sceneVector.update();
    this._sceneHeight.update();
    return requestAnimationFrame(this._update);
  };

  return Main;

})();

new Main();
