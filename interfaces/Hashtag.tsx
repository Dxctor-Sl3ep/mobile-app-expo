export interface Hashtag {
  id: string;
  label: string;
}

export interface DreamHashtags {
  hashtag1: Hashtag;
  hashtag2: Hashtag;
  hashtag3: Hashtag;
}

export const hashtags: DreamHashtags = {
  hashtag1: { id: '', label: '' },
  hashtag2: { id: '', label: '' },
  hashtag3: { id: '', label: '' },
};
