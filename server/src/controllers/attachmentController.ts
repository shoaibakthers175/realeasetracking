import { Request, Response, NextFunction } from 'express';
import { Attachment } from '../models/Attachment';
import { sendSuccess, sendError } from '../utils/response';

export const uploadAttachment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return sendError(res, 'No file uploaded', 400, 'NO_FILE');
    }

    const { entityType, entityId } = req.body;

    const fileUrl = `/uploads/${req.file.filename}`;

    const attachment = await Attachment.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      url: fileUrl,
      uploadedBy: req.user?.id,
      entityType: entityType || 'SanityReport',
      entityId: entityId || undefined,
    });

    return sendSuccess(
      res,
      {
        id: attachment._id,
        filename: attachment.filename,
        originalName: attachment.originalName,
        url: attachment.url,
        size: attachment.size,
        mimeType: attachment.mimeType,
      },
      'File uploaded successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};
