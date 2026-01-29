export class ShatterPipeline extends Phaser.Renderer.WebGL.Pipelines
  .SinglePipeline {
  constructor(game) {
    super({
      game,
      name: "shatter",
      fragShader: `
precision mediump float;
uniform sampler2D uMainSampler;
uniform float uTime;
varying vec2 outTexCoord;
varying vec4 outTint;

float noise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    // Use tint alpha as progress (1.0 = normal, 0.0 = fully shattered)
    float progress = 1.0 - outTint.a;
    
    vec2 uv = outTexCoord;
  
    vec4 color = texture2D(uMainSampler, uv);
    
 float dissolvePattern = noise(uv * 20.0 + uTime * 0.3);
    
    // Create threshold for dissolving
    float dissolveThreshold = progress * 1.1;
    
    // If the noise is below the threshold, make this pixel transparent
    if (dissolvePattern < dissolveThreshold) {
        discard;
    }

    
    // Apply the sprite's original alpha and tint
    color.a *= outTint.a;
    color.rgb *= outTint.rgb;
    
    gl_FragColor = color;
}
`,
    });
  }

  onPreRender() {
    this.set1f("uTime", this.game.loop.time / 1000);
  }
}
