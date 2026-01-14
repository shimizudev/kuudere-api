export interface ExtractedData {
  obfuscation_seed: string;
  obfuscated_crypto_data: Record<string, unknown>;
  video_id: string;
  video_title: string;
  thumbnail: string;
  subtitles: Array<{
    url: string;
    language: string;
    format: string;
    default: boolean;
  }>;
  player_settings: {
    primary_color: string;
    secondary_color: string;
    show_download_button: boolean;
    show_share_button: boolean;
    show_fullscreen_button: boolean;
    show_quality_selector: boolean;
    show_branding: boolean;
    show_pip_button: boolean;
    show_screenshot_button: boolean;
  };
  chapters: unknown[];
  available_fonts: Record<string, string>;
  extracted_fonts: string[];
  is_live: boolean;
  autoplay: boolean;
  premium: boolean;
  start_at: string | null;
  skip_intro: boolean;
  skip_outro: boolean;
  intro_chapter: unknown | null;
  outro_chapter: unknown | null;
  thumbnails_vtt: string;
  aid: string;
  default_audio_track: number;
  audio_type: string;
  is_iframe: boolean;
  iframe_domain: string | null;
  is_domain_owner: boolean;
  is_host: boolean;
}
