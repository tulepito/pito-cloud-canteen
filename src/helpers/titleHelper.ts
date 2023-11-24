import * as unidecode from 'unidecode';

export function searchKeywords(title: string, keywords: string | string[]) {
  const mapKeywordCharacters = (
    Array.isArray(keywords) ? keywords : keywords.split(' ')
  ).reduce((acc, current) => {
    const currentLowerCase = String(unidecode(current.toLocaleLowerCase()));
    if (!acc.has(currentLowerCase)) {
      acc.set(currentLowerCase, currentLowerCase);
    }

    return acc;
  }, new Map<string, string>());

  const searchingTitle: { text: string; isMatchKeywords: boolean }[] = [];
  const titleCharacters = title.split(' ');
  let previousText: string[] = [titleCharacters[0]];
  let previousIsMatchKeywords: boolean = mapKeywordCharacters.has(
    String(unidecode(titleCharacters[0].toLowerCase())),
  );

  for (let index = 1; index < titleCharacters.length; index++) {
    const value = titleCharacters[index];
    const isMatchKeywords = mapKeywordCharacters.has(
      String(unidecode(value.toLowerCase())),
    );
    if (previousIsMatchKeywords !== isMatchKeywords) {
      searchingTitle.push({
        text: previousText.join(' '),
        isMatchKeywords: previousIsMatchKeywords,
      });
      previousIsMatchKeywords = isMatchKeywords;
      previousText = [value];
    } else {
      previousText.push(value);
    }
  }
  searchingTitle.push({
    text: previousText.join(' '),
    isMatchKeywords: previousIsMatchKeywords,
  });

  return searchingTitle;
}
