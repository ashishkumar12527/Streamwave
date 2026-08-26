const configuredMusicApi = process.env.NEXT_PUBLIC_SAAVN_API?.replace(/\/$/, "");
const MUSIC_API =
  !configuredMusicApi || configuredMusicApi.includes("saavn.dev") || configuredMusicApi.includes("saavn.me")
    ? "https://jiosaavn-api.vercel.app"
    : configuredMusicApi;

const toImageList = (images) => {
  if (Array.isArray(images)) return images;
  return [
    { url: images?.["50x50"] || images || "" },
    { url: images?.["150x150"] || images || "" },
    { url: images?.["500x500"] || images || "" },
  ];
};

const normalizeSong = (song) => ({
  ...song,
  type: "song",
  name: song?.name || song?.title || song?.song,
  image: toImageList(song?.image || song?.images),
  artists: song?.artists || {
    primary: (song?.primary_artists || song?.more_info?.singers || "")
      .split(",")
      .filter(Boolean)
      .map((name) => ({ name: name.trim() })),
  },
});

// home page data
export async function homePageData(language) {
  try {
    const lang = Array.isArray(language) ? language.join(",") : language?.toString() || "";
    if (MUSIC_API.includes("jiosaavn-api.vercel.app")) {
      const response = await fetch(
        `${MUSIC_API}/api/search?query=${encodeURIComponent("trending " + lang)}`,
        { next: { revalidate: 86400 } },
      );
      if (!response.ok) return null;
      const data = await response.json();
      const songs = (data?.results || []).map(normalizeSong);
      return { trending: { songs }, charts: songs, albums: songs, playlists: songs };
    }
    const response = await fetch(
      `${MUSIC_API}/api/modules?language=${encodeURIComponent(lang)}`,
      {
        next: {
          revalidate: 86400,
        },
      },
    );
    if (!response.ok) return null;
    const data = await response.json();
    return data?.data;
  } catch (error) {
    console.log("homePageData error:", error);
    return null;
  }
}

// get song data
export async function getSongData(id) {
  try {
    if (MUSIC_API.includes("jiosaavn-api.vercel.app")) {
      const response = await fetch(`${MUSIC_API}/song?id=${encodeURIComponent(id)}`);
      if (!response.ok) return null;
      const data = await response.json();
      const song = data?.song ? { ...data, title: data.song } : data;
      return normalizeSong({
        ...song,
        downloadUrl: [
          { url: data?.media_urls?.["96_KBPS"] || "" },
          { url: data?.media_urls?.["160_KBPS"] || "" },
          { url: data?.media_urls?.["320_KBPS"] || "" },
          { url: data?.media_url || "" },
        ],
      });
    }
    const response = await fetch(
      `${MUSIC_API}/api/songs/${id}`,
    );
    if (!response.ok) return null;
    const data = await response.json();
    console.log("song data", data);
    return data?.data;
  } catch (error) {
    console.log("getSongData error:", error);
    return null;
  }
}

// get album data
export async function getAlbumData(id) {
  try {
    const response = await fetch(
      `${MUSIC_API}/api/albums?id=${id}`,
    );
    if (!response.ok) return null;
    const data = await response.json();
    return data?.data;
  } catch (error) {
    console.log("getAlbumData error:", error);
    return null;
  }
}

// get playlist data
export async function getplaylistData(id) {
  try {
    const response = await fetch(
      `${MUSIC_API}/api/playlists?id=${id}&limit=50`,
    );
    if (!response.ok) return null;
    const data = await response.json();
    return data?.data;
  } catch (error) {
    console.log("getplaylistData error:", error);
    return null;
  }
}

// get Lyrics data
export async function getlyricsData(lyricsId) {
  try {
    const response = await fetch(
      `${MUSIC_API}/api/songs/${encodeURIComponent(lyricsId)}/lyrics`,
    );
    if (!response.ok) return null;
    const data = await response.json();
    return data?.data;
  } catch (error) {
    console.log("getlyricsData error:", error);
    return null;
  }
}

// get artist data
export async function getArtistData(id) {
  try {
    const response = await fetch(
      `${MUSIC_API}/api/artists?id=${id}`,
    );
    if (!response.ok) return null;
    const data = await response.json();
    return data?.data;
  } catch (error) {
    console.log("getArtistData error:", error);
    return null;
  }
}

// get artist songs
export async function getArtistSongs(id, page) {
  try {
    const response = await fetch(
      `${MUSIC_API}/api/artists/${id}/songs?page=${page}&`,
    );
    if (!response.ok) return null;
    const data = await response.json();
    return data?.data;
  } catch (error) {
    console.log("getArtistSongs error:", error);
    return null;
  }
}

// get artist albums
export async function getArtistAlbums(id, page) {
  try {
    const response = await fetch(
      `${MUSIC_API}/api/artists/${id}/albums?page=${page}`,
    );
    if (!response.ok) return null;
    const data = await response.json();
    return data?.data;
  } catch (error) {
    console.log("getArtistAlbums error:", error);
    return null;
  }
}

// get search data
export async function getSearchedData(query) {
  try {
    const response = await fetch(
      `${MUSIC_API}/api/search?query=${encodeURIComponent(query)}`,
    );
    if (!response.ok) return null;
    const data = await response.json();
    if (MUSIC_API.includes("jiosaavn-api.vercel.app")) {
      return { songs: (data?.results || []).map(normalizeSong) };
    }
    return data?.data;
  } catch (error) {
    console.log("getSearchedData error:", error);
    return null;
  }
}

// add and remove from favourite
export async function addFavourite(id) {
  try {
    const response = await fetch("/api/favourite", {
      method: "POST",
      body: JSON.stringify(id),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data;
  } catch (error) {
    console.log("Add favourite API error", error);
    return null;
  }
}

// get favourite
export async function getFavourite() {
  try {
    const response = await fetch("/api/favourite");
    if (!response.ok) return null;
    const data = await response.json();
    return data?.data?.favourites;
  } catch (error) {
    console.log("Get favourite API error", error);
    return null;
  }
}

// user info
export async function getUserInfo() {
  try {
    const response = await fetch("/api/userInfo");
    if (!response.ok) return null;
    const data = await response.json();
    return data?.data;
  } catch (error) {
    console.log("Get user info API error", error);
    return null;
  }
}

// reset password
export async function resetPassword(password, confirmPassword, token) {
  try {
    const response = await fetch("/api/forgotPassword", {
      method: "PUT",
      body: JSON.stringify({ password, confirmPassword, token }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data;
  } catch (error) {
    console.log("Reset password API error", error);
    return null;
  }
}

// send reset password link
export async function sendResetPasswordLink(email) {
  try {
    const response = await fetch("/api/forgotPassword", {
      method: "POST",
      body: JSON.stringify({ email }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data;
  } catch (error) {
    console.log("Send reset password link API error", error);
    return null;
  }
}

// get  recommended songs
export async function getRecommendedSongs(artistId, songId) {
  try {
    const response = await fetch(
      `${MUSIC_API}/api/songs/${songId}/suggestions`,
    );
    if (!response.ok) return null;
    const data = await response.json();
    return data?.data;
  } catch (error) {
    console.log("getRecommendedSongs error:", error);
    return null;
  }
}
