export class CRTPipeline extends Phaser.Renderer.WebGL.Pipelines
  .PostFXPipeline {
  constructor(game) {
    super({
      game,
      name: "crt",
      fragShader: `
precision mediump float;
uniform sampler2D uMainSampler;
uniform vec2 uResolution;
uniform float uTime;
varying vec2 outTexCoord;

vec2 curve(vec2 uv)
{
	uv = (uv - 0.5) * 2.0;
	uv *= 1.1;	
	uv.x *= 1.0 + pow((abs(uv.y) / 5.0), 2.0);
	uv.y *= 1.0 + pow((abs(uv.x) / 4.0), 2.0);
	uv  = (uv / 2.0) + 0.5;
	uv =  uv *0.92 + 0.04;
	return uv;
}

void main()
{
    vec2 q = outTexCoord;
    vec2 uv = q;
    uv = curve( uv );
    vec3 oricol = texture2D( uMainSampler, vec2(q.x,q.y) ).xyz;
    vec3 col;
	float x =  sin(0.3*uTime+uv.y*21.0)*sin(0.7*uTime+uv.y*29.0)*sin(0.3+0.33*uTime+uv.y*31.0)*0.0017;

    col.r = texture2D(uMainSampler,vec2(x+uv.x+0.001,uv.y+0.001)).x+0.05;
    col.g = texture2D(uMainSampler,vec2(x+uv.x+0.000,uv.y-0.002)).y+0.05;
    col.b = texture2D(uMainSampler,vec2(x+uv.x-0.002,uv.y+0.000)).z+0.05;
    col.r += 0.08*texture2D(uMainSampler,0.75*vec2(x+0.025, -0.027)+vec2(uv.x+0.001,uv.y+0.001)).x;
    col.g += 0.05*texture2D(uMainSampler,0.75*vec2(x+-0.022, -0.02)+vec2(uv.x+0.000,uv.y-0.002)).y;
    col.b += 0.08*texture2D(uMainSampler,0.75*vec2(x+-0.02, -0.018)+vec2(uv.x-0.002,uv.y+0.000)).z;

    col = clamp(col*0.6+0.4*col*col*1.0,0.0,1.0);

    float vig = (0.0 + 1.0*16.0*uv.x*uv.y*(1.0-uv.x)*(1.0-uv.y));
	col *= vec3(pow(vig,0.3));

    col *= vec3(0.95,1.05,0.95);
	col *= 2.8;

	float scans = clamp( 0.35+0.35*sin(15.0*uTime+uv.y*uResolution.y*1.5), 0.0, 1.0);
	
	float s = pow(scans,1.7);
	col = col*vec3( 0.4+0.7*s) ;

    col *= 1.0+0.01*sin(110.0*uTime);
	if (uv.x < 0.0 || uv.x > 1.0)
		col *= 0.0;
	if (uv.y < 0.0 || uv.y > 1.0)
		col *= 0.0;
	
	col*=1.0-0.65*vec3(clamp((mod(gl_FragCoord.x, 2.0)-1.0)*2.0,0.0,1.0));
	
    // Add glow effect
    vec3 glow = vec3(0.0);
    vec2 texelSize = 1.0 / uResolution;
    
    for(float i = -16.0; i <= 16.0; i += 2.0) {
        for(float j = -16.0; j <= 16.0; j += 2.0) {
            vec2 offset = vec2(i, j) * texelSize;
            vec3 sample = texture2D(uMainSampler, uv + offset).xyz;
            float distance = length(vec2(i, j));
            float weight = exp(-distance * distance / 128.0);
            glow += sample * weight;
        }
    }
    
    col += glow * 0.02;
    
    float comp = smoothstep( 0.1, 0.9, sin(uTime) );
 
	// Remove the next line to stop cross-fade between original and postprocess
//	col = mix( col, oricol, comp );

    gl_FragColor = vec4(col,1.0);
}
`,
    });
  }

  onPreRender() {
    this.set1f("uTime", this.game.loop.time / 1000);
    this.set2f("uResolution", this.renderer.width, this.renderer.height);
  }
}
