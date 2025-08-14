import type { ICategory, ILogo, TCategory, TRawLogo } from '@/types';
import { slugify } from '@/utils';
import { prependFullUrlToLogo } from '@/utils/prependFullUrl';

import { logos } from './logos';
import { v4 as uuidv4 } from 'uuid';

export const logosData: ILogo[] = (logos as TRawLogo[]).map((logo: TRawLogo, index) => {
    return { ...logo, id: uuidv4(), order: index + 1 } as ILogo;
});

export const logosWithFullUrls = logosData.map((logo: TRawLogo) => {
    return {
        ...logo,
        route: prependFullUrlToLogo(logo.route)
    };
}) as ILogo[];

export const getAllLogos = JSON.stringify(logosData);

export const getCategories = () => {
    const uniqueCategories = [...new Set<TCategory>(logos.flatMap((logo) => logo.categories))] as TCategory[];
    if (uniqueCategories.length === 0) {
        return [];
    }

    const categoriesWithCounts = uniqueCategories.map((category: TCategory) => ({
        name: category,
        slug: slugify(category),
        count: logos.filter((logo) => logo.categories.includes(category)).length
    }));

    // a-z
    categoriesWithCounts.sort((a, b) => a.name.localeCompare(b.name));

    return categoriesWithCounts as ICategory[];
};

export const getCategoriesSlug = () => {
    const uniqueCategories = new Set<string>(logos.flatMap((logo) => logo.categories)) as Set<TCategory>;

    if (uniqueCategories.size === 0) {
        return [];
    }

    const categories = Array.from(uniqueCategories).map((category) => ({
        slug: slugify(category)
    }));

    return categories as { slug: string }[];
};

export const getLogoBySlug = (slug: string): ILogo | undefined => {
    return logosData.find((logo) => slugify(logo.title) === slug);
};
