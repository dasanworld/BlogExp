export const normalizeUrl = (url: string): string => {
  let normalized = url.trim();
  
  if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
    normalized = `https://${normalized}`;
  }
  
  try {
    const urlObj = new URL(normalized);
    return urlObj.toString();
  } catch {
    return normalized;
  }
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const extractDomain = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return '';
  }
};

export const isInstagramUrl = (url: string): boolean => {
  const domain = extractDomain(url);
  return domain.includes('instagram.com');
};

export const isYoutubeUrl = (url: string): boolean => {
  const domain = extractDomain(url);
  return domain.includes('youtube.com') || domain.includes('youtu.be');
};

export const isTiktokUrl = (url: string): boolean => {
  const domain = extractDomain(url);
  return domain.includes('tiktok.com');
};

export const isTwitterUrl = (url: string): boolean => {
  const domain = extractDomain(url);
  return domain.includes('twitter.com') || domain.includes('x.com');
};

export const isFacebookUrl = (url: string): boolean => {
  const domain = extractDomain(url);
  return domain.includes('facebook.com') || domain.includes('fb.com');
};

export const isNaverBlogUrl = (url: string): boolean => {
  const domain = extractDomain(url);
  return domain.includes('naver.com') || domain.includes('blog.naver.com');
};

export const isThreadsUrl = (url: string): boolean => {
  const domain = extractDomain(url);
  return domain.includes('threads.net');
};

export const isGeneralBlogUrl = (url: string): boolean => {
  const domain = extractDomain(url);
  return domain.includes('blog') || 
         domain.includes('wordpress.com') || 
         domain.includes('medium.com') ||
         domain.includes('tistory.com') ||
         domain.includes('velog.io');
};

export const validateChannelUrl = (url: string, channelType: string): boolean => {
  const normalizedUrl = normalizeUrl(url);
  
  if (!isValidUrl(normalizedUrl)) {
    return false;
  }
  
  switch (channelType.toLowerCase()) {
    case 'instagram':
      return isInstagramUrl(normalizedUrl);
    case 'youtube':
      return isYoutubeUrl(normalizedUrl);
    case 'tiktok':
      return isTiktokUrl(normalizedUrl);
    case 'twitter':
      return isTwitterUrl(normalizedUrl);
    case 'facebook':
      return isFacebookUrl(normalizedUrl);
    case 'naver':
      return isNaverBlogUrl(normalizedUrl);
    case 'threads':
      return isThreadsUrl(normalizedUrl);
    case 'blog':
      return isGeneralBlogUrl(normalizedUrl) || true;
    default:
      return true;
  }
};

export const removeUrlParameters = (url: string): string => {
  try {
    const urlObj = new URL(url);
    urlObj.search = '';
    return urlObj.toString();
  } catch {
    return url;
  }
};
