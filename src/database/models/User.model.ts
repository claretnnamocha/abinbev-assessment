import * as bcrypt from 'bcryptjs';
import { authenticator } from 'otplib';
import { DataTypes, UUIDV4 } from 'sequelize';
import { Column, IsUUID, Model, PrimaryKey, Table } from 'sequelize-typescript';

@Table({ timestamps: true, paranoid: true })
export class User extends Model {
  @IsUUID('4')
  @PrimaryKey
  @Column({
    defaultValue: UUIDV4,
    type: DataTypes.STRING,
  })
  public id: string;

  @Column({ type: DataTypes.STRING, allowNull: false })
  public email: string;

  @Column({ type: DataTypes.STRING })
  public firstName: string;

  @Column({ type: DataTypes.STRING })
  public lastName: string;

  @Column({
    type: DataTypes.STRING,
    values: ['user', 'admin'],
    defaultValue: 'user',
  })
  public role: 'user' | 'admin';

  @Column({
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'active',
    values: ['active', 'suspended', 'blocked'],
  })
  public status: 'active' | 'suspended' | 'blocked';

  @Column({
    type: DataTypes.STRING,
    set(value: string) {
      const salt = bcrypt.genSaltSync();
      this.setDataValue('password', bcrypt.hashSync(value, salt));
    },
  })
  public password: string;

  @Column({ type: DataTypes.TEXT })
  public totp: string;

  @Column({
    type: DataTypes.STRING,
  })
  public lastLoggedInAt: string;

  toJSON() {
    const data = { ...this.dataValues };
    delete data.password;
    delete data.totp;
    delete data.deletedAt;

    return data;
  }

  validatePassword(val: string) {
    return bcrypt.compareSync(val, this.password);
  }

  validateTotp(token: string, digits = 6, window = 0.5) {
    authenticator.options = { digits, step: window * 60 };
    return authenticator.check(token, this.totp);
  }

  generateTotp(digits = 6, window = 5) {
    authenticator.options = { digits, step: window * 60 };
    return authenticator.generate(this.totp);
  }

  async regenerateOtpSecret() {
    const user = await User.findByPk(this.id);
    user.update({ totp: authenticator.generateSecret() });
  }
}
