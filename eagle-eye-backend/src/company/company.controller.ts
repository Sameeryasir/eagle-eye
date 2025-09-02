import {
  Body,
  Controller,
  Post,
  ValidationPipe,
  UseGuards,
  Put,
  Request,
  Param,
  Delete,
  Get,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './companyDto/create-company.dto';
import { AuthGuard } from '@nestjs/passport';
import { UpdateCompanyDto } from './companyDto/update-company.dto';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}
  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getCompany(@Request() req) {
    const user = req.user;
    const companies = await this.companyService.getCompany(user);
    return companies;
  }

  @Post('create')
  @UseGuards(AuthGuard('jwt'))
  async createCompany(
    @Body(ValidationPipe) companydto: CreateCompanyDto,
    @Request() req,
  ) {
    const user = req?.user;
    console.log(user);
    const company = await this.companyService.createCompany(companydto, user);
    return company;
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  async updateCompany(
    @Param('id') id: string, // ✅ Get :id from URL
    @Body(ValidationPipe) companyDto: UpdateCompanyDto, // ✅ Validate incoming body
    @Request() req, // ✅ Get logged-in user
  ) {
    const user = req.user;
    const company = await this.companyService.updateCompany(
      companyDto,
      user,
      parseInt(id),
    );
    return company;
  }
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async deleteCompany(@Param('id') id: string, @Request() req) {
    const user = req.user;
    const deletedCompany = await this.companyService.deleteCompany(
      Number(id),
      user,
    );
    return deletedCompany;
  }
}
