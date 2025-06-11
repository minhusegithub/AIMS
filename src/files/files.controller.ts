import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, ParseFilePipeBuilder, HttpStatus, BadRequestException } from '@nestjs/common';
import { FilesService } from './files.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public, ResponseMessage } from 'src/decorator/customize';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Public()
  @Post('upload')
  @ResponseMessage('Upload single file')
  @UseInterceptors(FileInterceptor('fileUpload', {
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/^image\/(png|jpeg|jpg)$/)) {
        return cb(new BadRequestException('Chỉ chấp nhận file ảnh (PNG, JPG, JPEG)!'), false);
      }
      cb(null, true);
    }
  }))
  uploadFile(@UploadedFile(
    new ParseFilePipeBuilder()
      .addMaxSizeValidator({
        maxSize: 1024 * 1024 // 1MB
      })
      .build({
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
      }),
  ) file: Express.Multer.File) {
   
    return {
      filename: file.filename,
      destination: file.destination,
      originalname: file.originalname,
      size: file.size,
      mimetype: file.mimetype
    };
  }

  @Get()
  findAll() {
    return this.filesService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id') id: string
  ) {
    return this.filesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFileDto: UpdateFileDto
  ) {
    return this.filesService.update(+id, updateFileDto);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string
  ) {
    return this.filesService.remove(+id);
  }
}
