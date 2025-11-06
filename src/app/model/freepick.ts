export interface IFreepikImageRequest {
  prompt: string;
  negativePrompt?: string;
  numImages?: number;
  size?: string;
}

export interface IFreepikImageResponse {
  success: boolean;
  message?: string;
  imagePath?: string
}

export interface IFreepikImageMysticRequest {
  prompt: string;
  size?: string;
  resolution?: string;
  model?:string;
  creativedetailing?: number;
  webhookurl?: string;
}