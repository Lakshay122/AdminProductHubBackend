class ApiFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  filter() {
    const queryCopy = { ...this.queryStr };

    const removeFields = ["keyword", "page", "limit", "category", "expand"];
    removeFields.forEach((key) => delete queryCopy[key]);
    if (this.queryStr.search) {
      const searchValue = this.queryStr.search.trim();

      queryCopy.$or = [
        { name: { $regex: searchValue, $options: "i" } },
        { email: { $regex: searchValue, $options: "i" } },
        { phone: { $regex: searchValue, $options: "i" } },
        { description: { $regex: searchValue, $options: "i" } },
      ];

      delete queryCopy.search;
    }

    let queryStr = JSON.stringify(queryCopy);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }
  pagination(resultPerPage) {
    const currentPage = Number(this.queryStr.page) || 1;
    const skip = (currentPage - 1) * resultPerPage;
    this.allData = this.query.clone();
    this.query = this.query.limit(resultPerPage).skip(skip);
    return {
      queryResult: this,
    };
    return this;
  }
}

module.exports = ApiFeatures;
