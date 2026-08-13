import { Request, Response } from "express";
import { prisma } from "database";

export const getProductsByShopId = async (req: Request, res: Response) => {
  try {
    const { shopId } = req.query;
    
    if (!shopId || typeof shopId !== "string") {
      res.status(400).json({ success: false, message: "shopId query parameter is required" });
      return;
    }

    const products = await prisma.product.findMany({
      where: { shopId, isActive: true },
      include: {
        category: true
      }
    });

    res.json({ success: true, products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        shop: {
          select: {
            id: true,
            name: true,
            address: true,
            openTime: true,
            closeTime: true
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({ product });
  } catch (error) {
    console.error("getProductById error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getMyProducts = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const shop = await prisma.shop.findFirst({ where: { ownerId: userId } });
    if (!shop) return res.status(404).json({ success: false, message: "Shop not found" });

    const products = await prisma.product.findMany({
      where: { shopId: shop.id },
      include: { category: true }
    });

    res.json({ success: true, products });
  } catch (error) {
    console.error("Error fetching my products:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const shop = await prisma.shop.findFirst({ where: { ownerId: userId } });
    if (!shop) return res.status(404).json({ success: false, message: "Shop not found" });

    const { name, description, price, stock, categoryName, image, isActive } = req.body;

    if (!name || !price || !categoryName) {
      return res.status(400).json({ success: false, message: "Name, price, and categoryName are required" });
    }

    // Handle Category (Find or Create) - Option 1 & 2 Support
    let category = await prisma.category.findUnique({ where: { name: categoryName } });
    if (!category) {
      category = await prisma.category.create({ data: { name: categoryName } });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock) || 0,
        image,
        isActive: isActive !== undefined ? isActive : true,
        shopId: shop.id,
        categoryId: category.id
      },
      include: { category: true }
    });

    res.status(201).json({ success: true, product });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const shop = await prisma.shop.findFirst({ where: { ownerId: userId } });
    if (!shop) return res.status(404).json({ success: false, message: "Shop not found" });

    const id = req.params.id as string;
    const { name, description, price, stock, categoryName, image, isActive } = req.body;

    const existingProduct = await prisma.product.findFirst({ where: { id, shopId: shop.id } });
    if (!existingProduct) return res.status(404).json({ success: false, message: "Product not found or unauthorized" });

    let categoryId = existingProduct.categoryId;
    if (categoryName) {
      let category = await prisma.category.findUnique({ where: { name: categoryName } });
      if (!category) {
        category = await prisma.category.create({ data: { name: categoryName } });
      }
      categoryId = category.id;
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existingProduct.name,
        description: description !== undefined ? description : existingProduct.description,
        price: price !== undefined ? parseFloat(price) : existingProduct.price,
        stock: stock !== undefined ? parseInt(stock) : existingProduct.stock,
        image: image !== undefined ? image : existingProduct.image,
        isActive: isActive !== undefined ? isActive : existingProduct.isActive,
        categoryId
      },
      include: { category: true }
    });

    res.json({ success: true, product });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const shop = await prisma.shop.findFirst({ where: { ownerId: userId } });
    if (!shop) return res.status(404).json({ success: false, message: "Shop not found" });

    const id = req.params.id as string;

    const existingProduct = await prisma.product.findFirst({ where: { id, shopId: shop.id } });
    if (!existingProduct) return res.status(404).json({ success: false, message: "Product not found or unauthorized" });

    await prisma.product.delete({ where: { id } });

    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
