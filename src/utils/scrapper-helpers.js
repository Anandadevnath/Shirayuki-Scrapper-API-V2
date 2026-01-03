export const extractText = ($, selector) => {
    try {
        return $(selector).text()?.trim() || null;
    } catch (error) {
        return null;
    }
};

export const extractAttribute = ($, selector, attribute) => {
    try {
        return $(selector).attr(attribute)?.trim() || null;
    } catch (error) {
        return null;
    }
};

export const extractAnimes = ($, selector) => {
    try {
        return $(selector)
            .map((_, el) => {
                const $el = $(el);
                const animeId =
                    $el
                        .find('.film-detail .film-name .dynamic-name')
                        ?.attr('href')
                        ?.slice(1)
                        .split('?ref=search')[0] || null;

                return {
                    id: animeId,
                    name: $el.find('.film-detail .film-name .dynamic-name')?.text()?.trim() || null,
                    jname:
                        $el.find('.film-detail .film-name .dynamic-name')?.attr('data-jname')?.trim() || null,
                    poster:
                        $el.find('.film-poster .film-poster-img')?.attr('data-src')?.trim() || null,
                    duration:
                        $el
                            .find('.film-detail .fd-infor .fdi-item.fdi-duration')
                            ?.text()
                            ?.trim() || null,
                    type:
                        $el
                            .find('.film-detail .fd-infor .fdi-item:nth-of-type(1)')
                            ?.text()
                            ?.trim() || null,
                    rating: $el.find('.film-poster .tick-rate')?.text()?.trim() || null,
                    episodes: {
                        sub:
                            Number(
                                $el
                                    .find('.film-poster .tick-sub')
                                    ?.text()
                                    ?.trim()
                                    .split(' ')
                                    .pop()
                            ) || null,
                        dub:
                            Number(
                                $el
                                    .find('.film-poster .tick-dub')
                                    ?.text()
                                    ?.trim()
                                    .split(' ')
                                    .pop()
                            ) || null,
                    },
                };
            })
            .get();
    } catch (error) {
        return [];
    }
};

export const extractMostPopularAnimes = ($, selector) => {
    try {
        return $(selector)
            .map((_, el) => {
                const $el = $(el);
                return {
                    id:
                        $el
                            .find('.film-detail .dynamic-name')
                            ?.attr('href')
                            ?.slice(1)
                            .trim() || null,
                    name: $el.find('.film-detail .dynamic-name')?.text()?.trim() || null,
                    jname:
                        $el
                            .find('.film-detail .film-name .dynamic-name')
                            ?.attr('data-jname')
                            ?.trim() || null,
                    poster:
                        $el
                            .find('.film-poster .film-poster-img')
                            ?.attr('data-src')
                            ?.trim() || null,
                    episodes: {
                        sub:
                            Number(
                                $el
                                    ?.find('.fd-infor .tick .tick-sub')
                                    ?.text()
                                    ?.trim()
                            ) || null,
                        dub:
                            Number(
                                $el
                                    ?.find('.fd-infor .tick .tick-dub')
                                    ?.text()
                                    ?.trim()
                            ) || null,
                    },
                    type:
                        $el
                            ?.find('.fd-infor .tick')
                            ?.text()
                            ?.trim()
                            ?.replace(/[	\s\n]+/g, ' ')
                            ?.split(' ')
                            ?.pop() || null,
                };
            })
            .get();
    } catch (error) {
        return [];
    }
};
