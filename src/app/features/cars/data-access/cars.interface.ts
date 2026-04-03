export interface Car {
  id: string;
  brand: string;
  model: string;
  name: string;
  year: number;
  price: number;
  carType: string;
  listingType: string;
  fuelType: string;
  transmissionType: string;
  mileage: number;
  location: string;
  imageUrl: string;
}

export interface CarsQuery {
  searchTerm?: string;
  listingType?: string;
  fuelType?: string;
  carType?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  pageNumber?: number;
  pageSize?: number;
}
