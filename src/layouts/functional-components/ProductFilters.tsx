import type { Collection } from "@/lib/types";
import React, { useMemo, useState } from "react";
import ShowTags from "./product/ShowTags";
import RangeSlider from "./rangeSlider/RangeSlider";

const ProductFilters = ({
  categories,
  tags,
  maxPriceData,
  categoriesWithCounts,
}: {
  categories: Collection[];
  tags: string[];
  maxPriceData: { amount: string; currencyCode: string };
  categoriesWithCounts: { category: string; productCount: number }[];
}) => {
  const [searchParams, setSearchParams] = useState(
    new URLSearchParams(window.location.search)
  );

  const selectedCategories = useMemo(() => searchParams.getAll("c"), [searchParams]);

  const updateSearchParams = (newParams: URLSearchParams) => {
    const newUrl = `${window.location.pathname}?${newParams.toString()}`;
    window.location.href = newUrl.toString();
    setSearchParams(newParams);
  };

  const handleCategoryClick = (handle: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    const current = newParams.getAll("c");
    const exists = current.includes(handle);
    newParams.delete("c");
    const next = exists ? current.filter((c) => c !== handle) : [...current, handle];
    next.forEach((c) => newParams.append("c", c));
    updateSearchParams(newParams);
  };

  return (
    <div>
      <div>
        <h5 className="mb-2 lg:text-xl">Select Price Range</h5>
        <hr className="border-border dark:border-darkmode-border" />
        <div className="pt-4">
          <RangeSlider maxPriceData={maxPriceData} />
        </div>
      </div>

      <div>
        <h5 className="mb-2 mt-4 lg:mt-6 lg:text-xl">Product Categories</h5>
        <hr className="border-border dark:border-darkmode-border" />
        <ul className="mt-4 space-y-4">
          {categories.map((category) => (
            <li
              key={category.handle}
              className={`flex items-center justify-between cursor-pointer ${selectedCategories.includes(category.handle)
                ? "text-text-dark dark:text-darkmode-text-dark font-semibold"
                : "text-text-light dark:text-darkmode-text-light"
                }`}
              onClick={() => handleCategoryClick(category.handle)}
            >
              {category.title}
              <span>
                {categoriesWithCounts.length > 0
                  ? `(${categoriesWithCounts.find(
                    (c) => c.category === category.title
                  )?.productCount || 0
                  })`
                  : `(0)`}
              </span>
            </li>
          ))}
        </ul>
      </div>


      {tags.length > 0 && (
        <div>
          <h5 className="mb-2 mt-8 lg:mt-10 lg:text-xl">Tags</h5>
          <hr className="border-border dark:border-darkmode-border" />
          <div className="mt-4">
            <ShowTags tags={tags} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductFilters;
