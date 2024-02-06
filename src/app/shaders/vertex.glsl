  <script id="vertex_shader" type="x-shader/x-vertex">
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
</script>
