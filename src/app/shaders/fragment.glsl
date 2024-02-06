
<script id="fragment_shader" type="x-shader/x-fragment">

    uniform sampler2D texture;
    varying vec2 vUv;

    void main()
    {
        gl_FragColor = texture2D( texture, vUv ); 
    }

</script>