//DOM variables
const darkModeButton = document.querySelector(".darkmode--togle__button");
const darkModeSpans = document.querySelectorAll(
  ".darkmode--togle__button > span"
);
const searchButton = document.querySelector(".search__button");
const returnButton = document.querySelector(".return__button");
const searchBar = document.getElementById("input__search");
const typeFilterSelect = document.getElementById("type__filter");
const sortBySelectForComics = document.getElementById("sortby--filter__comics");
const sortBySelectForCharacters = document.getElementById(
  "sortby--filter__characters"
);
const resultsTitle = document.querySelector(".results__title");
const resultsNumber = document.querySelector(".results__number");
const loader = document.querySelector(".loader--container");
const resultsContainer = document.querySelector(".results--container");
const resultsSection = document.querySelector(".section-results");
const comicsSection = document.querySelector(".section-comics");
const charactersSection = document.querySelector(".section-characters");
const firstPageButton = document.querySelector(".pages--button__first");
const lastPageButton = document.querySelector(".pages--button__last");
const rightPageButton = document.querySelector(".pages--button__right");
const leftPageButton = document.querySelector(".pages--button__left");
const currentPageSpan = document.querySelector(".current-page");
const totalPagesSpan = document.querySelector(".total-pages");

//Global Variables
const baseURL = "https://gateway.marvel.com/v1/public/";
const myApiKey = "09f672ea66d3144befdf6f7fc2796c10";
let type = "comics";
let sort = "title";
const itemsPerPage = 20;
let totalItems = 0;
let currentPage = 0;
let url = ``;
const noInfoMsg = `No disponible`;
const noResultsMsg = `<p>No se han encontrado resultados</p>`;
let totalPages = 0;

//Global functions
const clearSectionContent = (sectionClass) => (sectionClass.innerHTML = "");
const show = (elementName) => elementName.classList.remove("hidden");
const hide = (elementName) => elementName.classList.add("hidden");
//

window.onload = () => {
  show(loader);
  fetchInfo(createURL(type, sort));
};

const createURL = (paramType, paramSort, paramId, paramPath) => {
  url = `${baseURL + paramType}?apikey=${myApiKey}&offset=${
    currentPage * itemsPerPage
  }&orderBy=${paramSort}`;
  if (paramId) {
    url = `${baseURL + paramType}/${paramId}?apikey=${myApiKey}&offset=${
      currentPage * itemsPerPage
    }`;
  }
  if (paramPath) {
    url = `${
      baseURL + paramType
    }/${paramId}/${paramPath}?apikey=${myApiKey}&offset=${
      currentPage * itemsPerPage
    }`;
  }
  return url;
};

const fetchInfo = (url, id, path) => {
  fetch(url)
    .then((data) => data.json())
    .then((info) => {
      if (type === "comics") {
        if (path) {
          createCharactersCards(info);
        } else {
          id ? displayComicInfo(info) : createComicsCards(info);
        }
      } else {
        if (path) {
          createComicsCards(info);
        } else {
          id ? displayCharacterInfo(info) : createCharactersCards(info);
        }
      }
      updatePagination();
      hide(loader);
    });
};

const createComicsCards = (info) => {
  clearSectionContent(resultsContainer);
  info.data.results.map((comic) => {
    return (resultsContainer.innerHTML += `
        <article class="card--container__comic" id="${comic.id}">
          <div class="img--container__comic">
            <img class="thumbnail img__comic" src="${findAndReplaceBrokenImg(
              comic
            )}" alt="foto del cover"/>
          </div>
          <h3 class="title__comic">
            ${comic.title}
          </h3>
        </article>`);
  });
  displayComicSection();
  findResultsNumber(info);
};

const createCharactersCards = (info) => {
  show(loader);
  clearSectionContent(resultsContainer);
  info.data.results.map((character) => {
    return (resultsContainer.innerHTML += `<article class="card--container__character" id="${
      character.id
    }">
          <div class="img--container__character">
            <img class="thumbnail img__character" src="${findAndReplaceBrokenImg(
              character
            )}" alt="foto del personaje"/>
          </div>
          <div class="title--container__character">
            <h3 class="title__character">${character.name}</h3>
          </div>
        </article>`);
  });
  displayCharacterSection();
  findResultsNumber(info);
};

const findAndReplaceBrokenImg = (element) => {
  return element.thumbnail.path.includes("image_not_available")
    ? "imgs/not_found.jpg"
    : `${element.thumbnail.path}.${element.thumbnail.extension}`;
};

const findResultsNumber = (info) => {
  totalItems = info.data.total;
  resultsNumber.textContent = totalItems;
  return totalItems != 0 ? totalItems : showNoResultsMsg();
};

const showNoResultsMsg = () => {
  clearSectionContent(resultsContainer);
  show(resultsSection);
  resultsContainer.innerHTML = noResultsMsg;
};

//Search and Filter Functions
const updateSortByOptions = () => {
  typeFilterSelect.value === "characters"
    ? (hide(sortBySelectForComics), show(sortBySelectForCharacters))
    : (hide(sortBySelectForCharacters), show(sortBySelectForComics));
};

typeFilterSelect.onchange = updateSortByOptions;

const updateSortAndType = () => {
  type = typeFilterSelect.value;
  type === "characters"
    ? (sort = sortBySelectForCharacters.value)
    : (sort = sortBySelectForComics.value);
  return type, sort;
};

const thereIsInput = () => {
  if (searchBar.value) {
    return true;
  }
};

const searchByInput = () => {
  if (thereIsInput()) {
    searchInput = searchBar.value.toLowerCase();
    type = typeFilterSelect.value;

    if (type === "comics") {
      return `${url}&titleStartsWith=${searchInput}`;
    } else {
      return `${url}&nameStartsWith=${searchInput}`;
    }
  } else {
    return url;
  }
};

const search = () => {
  show(loader);
  currentPage = 0;
  updateSortAndType();
  createURL(type, sort);
  fetchInfo(searchByInput());
};

searchButton.onclick = search;

//Pagination
rightPageButton.onclick = () => {
  show(loader);
  currentPage++;
  clearSectionContent(resultsContainer);
  fetchInfo(createURL(type, sort));
};

leftPageButton.onclick = () => {
  show(loader);
  currentPage--;
  clearSectionContent(resultsContainer);
  fetchInfo(createURL(type, sort));
};

firstPageButton.onclick = () => {
  show(loader);
  currentPage = 0;
  clearSectionContent(resultsContainer);
  fetchInfo(createURL(type, sort));
};

lastPageButton.onclick = () => {
  show(loader);
  findLastPage();
  clearSectionContent(resultsContainer);
  fetchInfo(createURL(type, sort));
};

const findLastPage = () => {
  const totalPages = Math.floor(totalItems / itemsPerPage);
  const lastPageItems = totalItems % itemsPerPage;

  lastPageItems > 0
    ? (currentPage = totalPages)
    : (currentPage = totalPages - 1);

  return currentPage, totalPages;
};

const updatePagination = () => {
  totalPagesSpan.textContent = `${Math.floor(totalItems / itemsPerPage) + 1}`;
  currentPageSpan.textContent = `${currentPage + 1}`;

  let offset = currentPage * itemsPerPage;

  offset == 0
    ? ((leftPageButton.disabled = true), (firstPageButton.disabled = true))
    : ((leftPageButton.disabled = false), (firstPageButton.disabled = false));

  offset + itemsPerPage >= totalItems
    ? ((rightPageButton.disabled = true), (lastPageButton.disabled = true))
    : ((rightPageButton.disabled = false), (lastPageButton.disabled = false));
};

//Display Comic Info
const displayComicSection = () => {
  const comicCards = document.querySelectorAll(".card--container__comic");
  comicCards.forEach((comic) => {
    comic.onclick = () => {
      comicId = comic.id;
      clearSectionContent(resultsContainer);
      hide(resultsSection);
      show(comicsSection);
      type = "comics";
      fetchInfo(createURL("comics", "", comicId), comicId);
      hide(charactersSection);
      show(returnButton);
    };
  });
};

const displayComicInfo = (info) => {
  clearSectionContent(comicsSection);
  info.data.results.map((comic) => {
    const imgURL = findAndReplaceBrokenImg(comic);
    const onSaleDate = findSaleDate(comic);
    const writer = creatorsListHasWriter(comic);
    resultsTitle.textContent = `Personajes`;
    const characters = comic.characters.available
      ? displayIncludedCharacters(comic, comic.id)
      : updateAvailableCharacters(comic);

    return (comicsSection.innerHTML = `
    <article class="info--container__comic" id="${comic.id}">
      <div class="img--container__comic">
        <img class="thumbnail img__comic" src="${imgURL}" alt="foto del comic"/>
      </div>
      <div class="info--container__comic">
      <h2 class="title__comic">
        ${comic.title}
      </h2>
      <h3>Publicado:</h3>
      <p>${onSaleDate}</p>
      <h3>Guionista/s:</h3>
      <p>${writer}</p>
      <h3>Descripción:</h3>
      <p>${comic.description || noInfoMsg}</p>
      </div>
    </article>`);
  });
};

const creatorsListHasWriter = (comic) => {
  const creatorsList = comic.creators.items;
  const hasWriter = creatorsList.some((creator) => creator.role == "writer");

  return creatorsList.length > 0 && hasWriter
    ? findWriterName(creatorsList)
    : noInfoMsg;
};

const findWriterName = (creatorsList) => {
  const writerName = creatorsList
    .filter((creator) => creator.role == "writer")
    .map((creator) => creator.name);

  return writerName.length > 1 ? writerName.join(", ") : writerName[0];
};

const findSaleDate = (comic) => {
  const saleDate = comic.dates.find((date) => date.type == "onsaleDate").date;
  const saleDateObj = new Date(saleDate);

  return convertToLocalDate(saleDateObj);
};

const convertToLocalDate = (saleDateObj) => {
  const localDate =
    saleDateObj.toLocaleDateString() === "Invalid Date"
      ? noInfoMsg
      : saleDateObj.toLocaleDateString();
  return localDate;
};

const displayIncludedCharacters = (comic, comicId) => {
  show(loader);
  show(resultsSection);
  fetchInfo(createURL("comics", "", comicId, "characters"), "", "characters");
};

const updateAvailableCharacters = (comic) => {
  totalItems = comic.characters.available;
  resultsNumber.textContent = totalItems;
  showNoResultsMsg();
};

//Display Character Info
const displayCharacterSection = () => {
  const characterCards = document.querySelectorAll(
    ".card--container__character"
  );
  characterCards.forEach((character) => {
    character.onclick = () => {
      characterId = character.id;
      clearSectionContent(resultsContainer);
      hide(resultsSection);
      show(charactersSection);
      type = "characters";
      fetchInfo(createURL("characters", "", characterId, ""), characterId);
      hide(comicsSection);
      show(returnButton);
    };
  });
};

const displayCharacterInfo = (info) => {
  clearSectionContent(charactersSection);
  info.data.results.map((character) => {
    const imgURL = findAndReplaceBrokenImg(character);
    resultsTitle.textContent = `Comics`;
    const comics = character.comics.available
      ? displayComicsContainingCharacter(character, character.id)
      : updateAvailableComics(character);

    return (charactersSection.innerHTML = `
    <article class="info--container__character" id="${character.id}">
      <div class="img--container__character">
        <img class="thumbnail img__character" src="${imgURL}" alt="foto del personaje"/>
      </div>
      <div class="info--container__character">
      <h2 class="title__character">
        ${character.name}
      </h2>
      <h3>Descripción:</h3>
      <p>${character.description || noInfoMsg}</p>
      </div>
    </article>`);
  });
};

const displayComicsContainingCharacter = (character, characterId) => {
  show(loader);
  show(resultsSection);
  fetchInfo(createURL("characters", "", characterId, "comics"), "", "comics");
};

const updateAvailableComics = (character) => {
  totalItems = character.comics.available;
  resultsNumber.textContent = totalItems;
  showNoResultsMsg();
};

//Dark Mode
darkModeButton.onclick = () => {
  document.body.classList.toggle("dark-mode");
  darkModeSpans.forEach((span) => {
    span.classList.toggle("hidden");
  });
};

//Return function
returnButton.onclick = () => {
  hide(charactersSection);
  hide(comicsSection);
  hide(returnButton);

  type !== typeFilterSelect.value
    ? typeFilterSelect.value == "characters"
      ? fetchInfo(
          createURL(typeFilterSelect.value, sortBySelectForCharacters.value)
        )
      : fetchInfo(createURL("comics", sortBySelectForComics.value))
    : fetchInfo(createURL(type, sort));
};
