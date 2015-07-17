<?php

/**
 * Copyright (C) 2014-2015 OpenMediaVault Plugin Developers
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

interface IJob
{
    public function __construct($data);

    public function getId();

    public function getName();

    public function getType();

    public function getUrl();

    public function getPath();

    public function getSize();

    public function getProgress();

    public function getSpeed();

    public function getState();

   public function getCreateTime();

    public function getCompleteTime();

    public function getDownTime();

    public function getRemainTime();

    public function getFailCode();

    public function getVipChannel();

    public function getLixianChannel();

}
