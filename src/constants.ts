export const REVISION = '105dev' as const;

export const MOUSE = { LEFT: 0, MIDDLE: 1, RIGHT: 2 } as const;

export const CullFaceNone = 0 as const;
export const CullFaceBack = 1 as const;
export const CullFaceFront = 2 as const;
export const CullFaceFrontBack = 3 as const;

export const enum CullFace {
	None = 0,
	Back = 1,
	Front = 2,
	FrontBack = 3,
}

export const FrontFaceDirectionCW = 0 as const;
export const FrontFaceDirectionCCW = 1 as const;

export const enum FrontFaceDirection {
	CW = 0,
	CCW = 1,
}

export const BasicShadowMap = 0 as const;
export const PCFShadowMap = 1 as const;
export const PCFSoftShadowMap = 2 as const;

export const enum ShadowMapType {
	Basic = 0,
	PCF = 1,
	PCFSoft = 2,
}

export const FrontSide = 0 as const;
export const BackSide = 1 as const;
export const DoubleSide = 2 as const;

export const enum Side {
	Front = 0,
	Back = 1,
	Double = 2,
}

export const FlatShading = 1 as const;
export const SmoothShading = 2 as const;

export const enum Shading {
	Flat = 1,
	Smooth = 2,
}

export const NoColors = 0 as const;
export const FaceColors = 1 as const;
export const VertexColors = 2 as const;

export const enum Colors {
	No = 0,
	Face = 1,
	Vertex = 2,
}

export const NoBlending = 0 as const;
export const NormalBlending = 1 as const;
export const AdditiveBlending = 2 as const;
export const SubtractiveBlending = 3 as const;
export const MultiplyBlending = 4 as const;
export const CustomBlending = 5 as const;

export const enum Blending {
	No = 0,
	Normal = 1,
	Additive = 2,
	Subtractive = 3,
	Multiply = 4,
	Custom = 5,
}

export const AddEquation = 100 as const;
export const SubtractEquation = 101 as const;
export const ReverseSubtractEquation = 102 as const;
export const MinEquation = 103 as const;
export const MaxEquation = 104 as const;

export const enum BlendingEquation {
	Add = 100,
	Subtract = 101,
	ReverseSubtract = 102,
	Min = 103,
	Max = 104,
}

export const ZeroFactor = 200 as const;
export const OneFactor = 201 as const;
export const SrcColorFactor = 202 as const;
export const OneMinusSrcColorFactor = 203 as const;
export const SrcAlphaFactor = 204 as const;
export const OneMinusSrcAlphaFactor = 205 as const;
export const DstAlphaFactor = 206 as const;
export const OneMinusDstAlphaFactor = 207 as const;
export const DstColorFactor = 208 as const;
export const OneMinusDstColorFactor = 209 as const;

export const enum BlendingDstFactor {
	Zero = 200,
	One = 201,
	SrcColor = 202,
	OneMinusSrcColor = 203,
	SrcAlpha = 204,
	OneMinusSrcAlpha = 205,
	DstAlpha = 206,
	OneMinusDstAlpha = 207,
	DstColor = 208,
	OneMinusDstColor = 209,
}

export const SrcAlphaSaturateFactor = 210 as const;

export const enum BlendingSrcFactor {
	SrcAlphaSaturateFactor = 210,
}

export const NeverDepth = 0 as const;
export const AlwaysDepth = 1 as const;
export const LessDepth = 2 as const;
export const LessEqualDepth = 3 as const;
export const EqualDepth = 4 as const;
export const GreaterEqualDepth = 5 as const;
export const GreaterDepth = 6 as const;
export const NotEqualDepth = 7 as const;

export const enum DepthModes {
	Never = 0,
	Always = 1,
	Less = 2,
	LessEqual = 3,
	Equal = 4,
	GreaterEqual = 5,
	Greater = 6,
	NotEqual = 7,
}

export const MultiplyOperation = 0 as const;
export const MixOperation = 1 as const;
export const AddOperation = 2 as const;

export const enum Combine {
	Multiply = 0,
	Mix = 1,
	Add = 2,
}

export const NoToneMapping = 0 as const;
export const LinearToneMapping = 1 as const;
export const ReinhardToneMapping = 2 as const;
export const Uncharted2ToneMapping = 3 as const;
export const CineonToneMapping = 4 as const;
export const ACESFilmicToneMapping = 5 as const;

export const enum ToneMapping {
	No = 0,
	Linear = 1,
	Reinhard = 2,
	Uncharted2 = 3,
	Cineon = 4,
	ACESFilmic = 5,
}

export const UVMapping = 300 as const;
export const CubeReflectionMapping = 301 as const;
export const CubeRefractionMapping = 302 as const;
export const EquirectangularReflectionMapping = 303 as const;
export const EquirectangularRefractionMapping = 304 as const;
export const SphericalReflectionMapping = 305 as const;
export const CubeUVReflectionMapping = 306 as const;
export const CubeUVRefractionMapping = 307 as const;

export const enum Mapping {
	UV = 300,
	CubeReflection = 301,
	CubeRefraction = 302,
	EquirectangularReflection = 303,
	EquirectangularRefraction = 304,
	SphericalReflection = 305,
	CubeUVReflection = 306,
	CubeUVRefraction = 307,
}

export const RepeatWrapping = 1000 as const;
export const ClampToEdgeWrapping = 1001 as const;
export const MirroredRepeatWrapping = 1002 as const;

export const enum Wrapping {
	Repeat = 1000,
	ClampToEdge = 1001,
	MirroredRepeat = 1002,
}

export const NearestFilter = 1003 as const;
export const NearestMipMapNearestFilter = 1004 as const;
export const NearestMipMapLinearFilter = 1005 as const;
export const LinearFilter = 1006 as const;
export const LinearMipMapNearestFilter = 1007 as const;
export const LinearMipMapLinearFilter = 1008 as const;

export const enum TextureFilter {
	NearestFilter = 1003,
	NearestMipMapNearestFilter = 1004,
	NearestMipMapLinearFilter = 1005,
	LinearFilter = 1006,
	LinearMipMapNearestFilter = 1007,
	LinearMipMapLinearFilter = 1008,
}

export const UnsignedByteType = 1009 as const;
export const ByteType = 1010 as const;
export const ShortType = 1011 as const;
export const UnsignedShortType = 1012 as const;
export const IntType = 1013 as const;
export const UnsignedIntType = 1014 as const;
export const FloatType = 1015 as const;
export const HalfFloatType = 1016 as const;

export const enum TextureDataType {
	UnsignedByteType = 1009,
	ByteType = 1010,
	ShortType = 1011,
	UnsignedShortType = 1012,
	IntType = 1013,
	UnsignedIntType = 1014,
	FloatType = 1015,
	HalfFloatType = 1016,
}

export const UnsignedShort4444Type = 1017 as const;
export const UnsignedShort5551Type = 1018 as const;
export const UnsignedShort565Type = 1019 as const;
export const UnsignedInt248Type = 1020 as const;

export const enum PixelType {
	UnsignedShort4444 = 1017,
	UnsignedShort5551 = 1018,
	UnsignedShort565 = 1019,
	UnsignedInt248 = 1020,
}

export const AlphaFormat = 1021 as const;
export const RGBFormat = 1022 as const;
export const RGBAFormat = 1023 as const;
export const LuminanceFormat = 1024 as const;
export const LuminanceAlphaFormat = 1025 as const;
export const RGBEFormat = RGBAFormat;
export const DepthFormat = 1026 as const;
export const DepthStencilFormat = 1027 as const;
export const RedFormat = 1028 as const;

export const enum PixelFormat {
	Alpha = 1021,
	RGB = 1022,
	RGBA = 1023,
	Luminance = 1024,
	LuminanceAlpha = 1025,
	RGBE = 1023, // RGBAFormat,
	Depth = 1026,
	DepthStencil = 1027,
	Red = 1028,
}

export const RGB_S3TC_DXT1_Format = 33776 as const;
export const RGBA_S3TC_DXT1_Format = 33777 as const;
export const RGBA_S3TC_DXT3_Format = 33778 as const;
export const RGBA_S3TC_DXT5_Format = 33779 as const;

export const RGB_PVRTC_4BPPV1_Format = 35840 as const;
export const RGB_PVRTC_2BPPV1_Format = 35841 as const;
export const RGBA_PVRTC_4BPPV1_Format = 35842 as const;
export const RGBA_PVRTC_2BPPV1_Format = 35843 as const;

export const RGB_ETC1_Format = 36196 as const;

export const RGBA_ASTC_4x4_Format = 37808 as const;
export const RGBA_ASTC_5x4_Format = 37809 as const;
export const RGBA_ASTC_5x5_Format = 37810 as const;
export const RGBA_ASTC_6x5_Format = 37811 as const;
export const RGBA_ASTC_6x6_Format = 37812 as const;
export const RGBA_ASTC_8x5_Format = 37813 as const;
export const RGBA_ASTC_8x6_Format = 37814 as const;
export const RGBA_ASTC_8x8_Format = 37815 as const;
export const RGBA_ASTC_10x5_Format = 37816 as const;
export const RGBA_ASTC_10x6_Format = 37817 as const;
export const RGBA_ASTC_10x8_Format = 37818 as const;
export const RGBA_ASTC_10x10_Format = 37819 as const;
export const RGBA_ASTC_12x10_Format = 37820 as const;
export const RGBA_ASTC_12x12_Format = 37821 as const;

export const enum CompressedPixelFormat {
	RGB_S3TC_DXT1 = 33776,
	RGBA_S3TC_DXT1 = 33777,
	RGBA_S3TC_DXT3 = 33778,
	RGBA_S3TC_DXT5 = 33779,

	RGB_PVRTC_4BPPV1 = 35840,
	RGB_PVRTC_2BPPV1 = 35841,
	RGBA_PVRTC_4BPPV1 = 35842,
	RGBA_PVRTC_2BPPV1 = 35843,

	RGB_ETC1 = 36196,

	RGBA_ASTC_4x4 = 37808,
	RGBA_ASTC_5x4 = 37809,
	RGBA_ASTC_5x5 = 37810,
	RGBA_ASTC_6x5 = 37811,
	RGBA_ASTC_6x6 = 37812,
	RGBA_ASTC_8x5 = 37813,
	RGBA_ASTC_8x6 = 37814,
	RGBA_ASTC_8x8 = 37815,
	RGBA_ASTC_10x5 = 37816,
	RGBA_ASTC_10x6 = 37817,
	RGBA_ASTC_10x8 = 37818,
	RGBA_ASTC_10x10 = 37819,
	RGBA_ASTC_12x10 = 37820,
	RGBA_ASTC_12x12 = 37821,
}

export const LoopOnce = 2200 as const;
export const LoopRepeat = 2201 as const;
export const LoopPingPong = 2202 as const;

export const enum AnimationActionLoopStyles {
	Once = 2200,
	Repeat = 2201,
	PingPong = 2202,
}

export const InterpolateDiscrete = 2300 as const;
export const InterpolateLinear = 2301 as const;
export const InterpolateSmooth = 2302 as const;

export const enum InterpolationModes {
	Discrete = 2300,
	Linear = 2301,
	Smooth = 2302,
}

export const ZeroCurvatureEnding = 2400 as const;
export const ZeroSlopeEnding = 2401 as const;
export const WrapAroundEnding = 2402 as const;

export const enum InterpolationEndingModes {
	ZeroCurvature = 2400,
	ZeroSlope = 2401,
	WrapAround = 2402,
}

export const TrianglesDrawMode = 0 as const;
export const TriangleStripDrawMode = 1 as const;
export const TriangleFanDrawMode = 2 as const;

export const enum TrianglesDrawModes {
	Triangles = 0,
	TriangleStrip = 1,
	TriangleFan = 2,
}

export const LinearEncoding = 3000 as const;
export const sRGBEncoding = 3001 as const;
export const GammaEncoding = 3007 as const;
export const RGBEEncoding = 3002 as const;
export const LogLuvEncoding = 3003 as const;
export const RGBM7Encoding = 3004 as const;
export const RGBM16Encoding = 3005 as const;
export const RGBDEncoding = 3006 as const;

export const enum TextureEncoding {
	Linear = 3000,
	sRGB = 3001,
	Gamma = 3007,
	RGBE = 3002,
	LogLuv = 3003,
	RGBM7 = 3004,
	RGBM16 = 3005,
	RGBD = 3006,
}

export const BasicDepthPacking = 3200 as const;
export const RGBADepthPacking = 3201 as const;

export enum DepthPackingStrategies {
	Basic = 3200,
	RGBA = 3201,
}

export const TangentSpaceNormalMap = 0 as const;
export const ObjectSpaceNormalMap = 1 as const;

export enum NormalMapTypes {
	TangentSpace = 0,
	ObjectSpace = 1,
}
